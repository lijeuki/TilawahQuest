'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, ChevronLeft, RotateCcw, Play, Pause } from 'lucide-react';
import { LiveRecognition, type LiveRecognitionResult } from '@/lib/audio/live-recognition';
import { AudioRecorder } from '@/lib/audio/recorder';
import { QuranAudioPlayer } from '@/lib/audio/audio-player';
import { VoiceActivityDetector } from '@/lib/audio/voice-activity-detection';
import { verifyAyahRecitation, type VerificationResult } from '@/lib/quran/word-matcher';
import type { Ayah, Surah } from '@/types/quran';

interface SessionPracticeProps {
  surah: Surah;
  ayahs: Ayah[];
  onBack: () => void;
}

const AYAHS_PER_SESSION = 10;

export function SessionPractice({ surah, ayahs, onBack }: SessionPracticeProps) {
  const [currentSession, setCurrentSession] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [currentAyahInRecitation, setCurrentAyahInRecitation] = useState(-1); // Start at -1, first ayah is 0
  const [sessionResults, setSessionResults] = useState<Map<number, VerificationResult>>(new Map());
  const [recognizedTexts, setRecognizedTexts] = useState<Map<number, string>>(new Map());
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showingResult, setShowingResult] = useState(false);
  
  const liveRecognition = useRef<LiveRecognition | null>(null);
  const audioRecorder = useRef<AudioRecorder | null>(null);
  const audioPlayer = useRef<QuranAudioPlayer | null>(null);
  const vad = useRef<VoiceActivityDetector | null>(null);

  // Calculate session boundaries
  const startIndex = currentSession * AYAHS_PER_SESSION;
  const endIndex = Math.min(startIndex + AYAHS_PER_SESSION, ayahs.length);
  const sessionAyahs = ayahs.slice(startIndex, endIndex);
  const totalSessions = Math.ceil(ayahs.length / AYAHS_PER_SESSION);

  useEffect(() => {
    // Initialize on client side only
    if (typeof window !== 'undefined') {
      liveRecognition.current = new LiveRecognition();
      audioRecorder.current = new AudioRecorder();
      audioPlayer.current = new QuranAudioPlayer();
      vad.current = new VoiceActivityDetector();
    }

    return () => {
      audioPlayer.current?.cleanup();
      vad.current?.stop();
      liveRecognition.current?.stop();
    };
  }, []);

  const handlePlayReference = async () => {
    if (!audioPlayer.current) {
      alert('Audio player not initialized yet. Please try again.');
      return;
    }

    try {
      setIsPlayingReference(true);
      setCurrentAyahInRecitation(0);

      const ayahsToPlay = sessionAyahs.map(ayah => ({
        surah: ayah.surah,
        ayah: ayah.numberInSurah
      }));

      audioPlayer.current.setPlaybackRate(playbackSpeed);

      await audioPlayer.current.playAyahSequence(
        ayahsToPlay,
        'Alafasy_128kbps',
        (index) => {
          setCurrentAyahInRecitation(index);
        }
      );

      setIsPlayingReference(false);
      setCurrentAyahInRecitation(0);
    } catch (error: any) {
      console.error('Error playing reference:', error);
      alert(error.message);
      setIsPlayingReference(false);
    }
  };

  const handleStopReference = () => {
    audioPlayer.current?.stop();
    setIsPlayingReference(false);
    setCurrentAyahInRecitation(0);
  };

  const handleStartListening = async () => {
    if (!liveRecognition.current) {
      alert('Voice detection not initialized yet. Please try again.');
      return;
    }

    try {
      setIsListening(true);
      setCurrentAyahInRecitation(-1); // Start before first ayah
      setShowingResult(false);

      // Start continuous recognition
      liveRecognition.current.start(
        (result: LiveRecognitionResult) => {
          const fullText = result.text.trim();
          const partialText = result.partialText.trim();
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 Accumulated Text:', fullText);
          console.log('🔄 Partial Text:', partialText);
          console.log('📍 Expecting Next Ayah:', currentAyahInRecitation + 2); // Show what we're waiting for
          
          // Use ONLY the current accumulated text (will be reset after each ayah)
          const textToMatch = fullText.length > 0 ? fullText : partialText;
            
          console.log('🎯 Text to Check:', textToMatch.substring(0, 50));
          console.log('📏 Length:', textToMatch.length);
          
          // Only process if we have enough text
          if (textToMatch.length < 3) {
            console.log('⏭️ Skipping: Text too short');
            return;
          }
          
          // SIMPLE SEQUENTIAL DETECTION: Only check the NEXT expected ayah
          const nextAyahIndex = currentAyahInRecitation + 1;
          
          // Only check the next ayah in sequence (ignore all others)
          if (nextAyahIndex < sessionAyahs.length) {
            const nextAyah = sessionAyahs[nextAyahIndex];
            const verification = verifyAyahRecitation(textToMatch, nextAyah.text);
            
            console.log(`🔍 Checking Ayah ${nextAyahIndex + 1}: ${verification.accuracy.toFixed(1)}%`);
            
            // If next ayah detected with 70%+ accuracy, save and STOP for review
            if (verification.accuracy >= 70) {
              const globalIndex = startIndex + nextAyahIndex;
              
              console.log(`✅ Ayah ${nextAyahIndex + 1} DETECTED! Score: ${verification.accuracy.toFixed(1)}%`);
              
              // Save the result
              setSessionResults(prev => {
                const newMap = new Map(prev);
                newMap.set(globalIndex, verification);
                return newMap;
              });
              setRecognizedTexts(prev => {
                const newMap = new Map(prev);
                newMap.set(globalIndex, textToMatch);
                return newMap;
              });
              setCurrentAyahInRecitation(nextAyahIndex);
              
              // STOP listening to show result
              console.log('🛑 Stopping to show result...');
              liveRecognition.current?.stop();
              setIsListening(false);
              setShowingResult(true);
              
            } else {
              console.log(`⏸️ Keep reciting... (${verification.accuracy.toFixed(1)}% - need 70%+)`);
            }
          } else {
            console.log(`✅ SESSION COMPLETE! All ${sessionAyahs.length} ayahs detected! 🎉`);
          }

        },
        (error) => {
          console.error('Recognition error:', error);
          // Don't show alert for common errors, just log them
          // User can continue reciting
        }
      );

    } catch (error: any) {
      console.error('Error starting listening:', error);
      alert(error.message);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    liveRecognition.current?.stop();
    setIsListening(false);
  };

  const handleRetrySession = () => {
    setSessionResults(new Map());
    setRecognizedTexts(new Map());
    setCurrentAyahInRecitation(0);
    liveRecognition.current?.reset();
  };

  const handleNextSession = () => {
    if (currentSession < totalSessions - 1) {
      setCurrentSession(currentSession + 1);
      handleRetrySession();
    }
  };

  const handlePreviousSession = () => {
    if (currentSession > 0) {
      setCurrentSession(currentSession - 1);
      handleRetrySession();
    }
  };

  const completedCount = Array.from(sessionResults.entries())
    .filter(([index]) => index >= startIndex && index < endIndex)
    .filter(([_, result]) => result.accuracy >= 90).length;

  const sessionAccuracy = sessionResults.size > 0
    ? Array.from(sessionResults.values()).reduce((sum, r) => sum + r.accuracy, 0) / sessionResults.size
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-gray-600">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{surah.englishName}</h2>
              <p className="text-sm text-gray-600" dir="rtl">{surah.name}</p>
            </div>
            <div className="w-32" />
          </div>
        </CardHeader>
      </Card>

      {/* Pagination & Session Progress */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardContent className="pt-6">
          {/* Pagination for Long Surahs */}
          {totalSessions > 1 && (
            <div className="mb-4 pb-4 border-b-2 border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Pages</h3>
                <span className="text-xs text-gray-600">
                  {totalSessions} pages × 10 ayahs
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalSessions }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={currentSession === i ? "default" : "outline"}
                    onClick={() => {
                      setCurrentSession(i);
                      handleRetrySession();
                    }}
                    className={`w-12 h-12 rounded-lg font-bold ${
                      currentSession === i
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Page {currentSession + 1} Progress
            </span>
            <span className="text-sm text-gray-600">
              Ayahs {startIndex + 1}-{endIndex}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 mb-2 shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${(completedCount / sessionAyahs.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-700">{completedCount}/{sessionAyahs.length} completed</span>
            {sessionAccuracy > 0 && (
              <span className="text-teal-700">Avg: {sessionAccuracy.toFixed(0)}%</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reference Audio Controls - Bundle Option */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              Audio Options
            </CardTitle>
            <span className="text-xs text-gray-600">Sheikh Alafasy</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bundle: Play All Ayahs */}
          <div className="p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800">Bundle: All {sessionAyahs.length} Ayahs</h3>
                <p className="text-xs text-gray-600">Play all ayahs in sequence</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isPlayingReference ? (
                <Button
                  onClick={handlePlayReference}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  disabled={isListening}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Bundle
                </Button>
              ) : (
                <Button
                  onClick={handleStopReference}
                  variant="destructive"
                  className="flex-1 shadow-md"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Bundle
                </Button>
              )}
            </div>
          </div>

          {/* Playback Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Speed:</span>
            <Button
              size="sm"
              variant={playbackSpeed === 0.75 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(0.75)}
              className={`flex-1 ${playbackSpeed === 0.75 ? 'bg-blue-600' : 'border-blue-300 text-blue-700'}`}
            >
              0.75×
            </Button>
            <Button
              size="sm"
              variant={playbackSpeed === 1 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(1)}
              className={`flex-1 ${playbackSpeed === 1 ? 'bg-blue-600' : 'border-blue-300 text-blue-700'}`}
            >
              1×
            </Button>
            <Button
              size="sm"
              variant={playbackSpeed === 1.25 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(1.25)}
              className={`flex-1 ${playbackSpeed === 1.25 ? 'bg-blue-600' : 'border-blue-300 text-blue-700'}`}
            >
              1.25×
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 italic text-center">
            💡 Tip: Each ayah also has its own Play button above
          </p>
        </CardContent>
      </Card>

      {/* Continuous Listening */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            2. Recite Continuously
            {isListening && <span className="text-sm font-normal text-gray-600 ml-2">(Auto-detecting)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            {showingResult ? (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-green-700">
                  ✅ Ayah {currentAyahInRecitation + 1} Completed!
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {sessionResults.get(startIndex + currentAyahInRecitation)?.accuracy.toFixed(0)}%
                </div>
                {currentAyahInRecitation < sessionAyahs.length - 1 ? (
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      onClick={() => {
                        setShowingResult(false);
                        liveRecognition.current?.reset();
                        setTimeout(() => handleStartListening(), 500);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Continue to Ayah {currentAyahInRecitation + 2}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const nextAyah = sessionAyahs[currentAyahInRecitation + 1];
                        if (audioPlayer.current && nextAyah) {
                          await audioPlayer.current.playAyah(nextAyah.surah, nextAyah.numberInSurah, 'Alafasy_128kbps');
                        }
                      }}
                      className="w-full"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Hear Next Ayah First
                    </Button>
                  </div>
                ) : (
                  <div className="text-green-700 font-semibold">
                    🎉 Session Complete!
                  </div>
                )}
              </div>
            ) : !isListening ? (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700">
                  Ready for Ayah {currentAyahInRecitation + 2}
                </div>
                <Button
                  size="lg"
                  onClick={handleStartListening}
                  className="w-32 h-32 rounded-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isPlayingReference}
                >
                  <Mic className="h-12 w-12" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-900">
                  Recite Ayah {currentAyahInRecitation + 2}
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopListening}
                  className="w-32 h-32 rounded-full"
                >
                  <Pause className="h-10 w-10" />
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-gray-600">Listening...</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-900 mb-2 font-semibold">
              💡 How to Practice:
            </p>
            <ul className="text-sm text-emerald-800 space-y-1 ml-4">
              <li>• Click microphone for one ayah at a time</li>
              <li>• Recite clearly in Arabic</li>
              <li>• System detects at 70%+ accuracy</li>
              <li>• Review score and continue to next</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Session Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePreviousSession}
          disabled={currentSession === 0}
          className="flex-1"
        >
          Previous Session
        </Button>
        <Button
          variant="outline"
          onClick={handleRetrySession}
          className="flex-1"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry Session
        </Button>
        <Button
          onClick={handleNextSession}
          disabled={currentSession === totalSessions - 1}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          Next Session
        </Button>
      </div>
    </div>
  );
}
