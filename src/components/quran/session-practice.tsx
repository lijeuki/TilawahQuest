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

      {/* Session Progress */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Session {currentSession + 1} of {totalSessions}
            </span>
            <span className="text-sm text-gray-600">
              Ayahs {startIndex + 1}-{endIndex} of {ayahs.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / sessionAyahs.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{completedCount} of {sessionAyahs.length} completed</span>
            {sessionAccuracy > 0 && (
              <span>Average: {sessionAccuracy.toFixed(0)}%</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reference Audio Controls */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">1. Listen to Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {!isPlayingReference ? (
              <Button
                onClick={handlePlayReference}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isListening}
              >
                <Play className="h-4 w-4 mr-2" />
                Play All {sessionAyahs.length} Ayahs
              </Button>
            ) : (
              <Button
                onClick={handleStopReference}
                variant="destructive"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={playbackSpeed === 0.75 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(0.75)}
              className="flex-1"
            >
              0.75x
            </Button>
            <Button
              size="sm"
              variant={playbackSpeed === 1 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(1)}
              className="flex-1"
            >
              1x
            </Button>
            <Button
              size="sm"
              variant={playbackSpeed === 1.25 ? 'default' : 'outline'}
              onClick={() => setPlaybackSpeed(1.25)}
              className="flex-1"
            >
              1.25x
            </Button>
          </div>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>💡 How it works:</strong>
            </p>
            <ul className="text-sm text-blue-900 space-y-1 ml-4">
              <li>• Click the microphone button once</li>
              <li>• Grant microphone permission when prompted</li>
              <li>• Recite all {sessionAyahs.length} ayahs continuously (no pausing needed)</li>
              <li>• System will automatically detect and match each ayah</li>
              <li>• Speak clearly in Arabic for best results</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Ayahs Display with Results */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Session Ayahs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionAyahs.map((ayah, index) => {
            const globalIndex = startIndex + index;
            const result = sessionResults.get(globalIndex);
            const isCurrentlyReciting = isListening && currentAyahInRecitation === index;
            const isCurrentlyPlaying = isPlayingReference && currentAyahInRecitation === index;
            
            return (
              <div
                key={ayah.number}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentlyReciting || isCurrentlyPlaying
                    ? 'border-blue-500 bg-blue-50'
                    : result && result.accuracy >= 90
                    ? 'border-green-500 bg-green-50'
                    : result && result.accuracy >= 70
                    ? 'border-yellow-500 bg-yellow-50'
                    : result
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Ayah {ayah.numberInSurah}
                  </span>
                  {result && (
                    <span className="text-sm font-bold">
                      {result.accuracy.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl leading-relaxed mb-2" dir="rtl">
                  {ayah.text}
                </p>
                {result && result.mistakes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {result.mistakes.length} mistake(s) found
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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
