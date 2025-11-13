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
  const [currentAyahInRecitation, setCurrentAyahInRecitation] = useState(0);
  const [sessionResults, setSessionResults] = useState<Map<number, VerificationResult>>(new Map());
  const [recognizedTexts, setRecognizedTexts] = useState<Map<number, string>>(new Map());
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
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
      setCurrentAyahInRecitation(0);

      // Start continuous recognition
      liveRecognition.current.start(
        (result: LiveRecognitionResult) => {
          const fullText = result.text.trim();
          const partialText = result.partialText.trim();
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 Accumulated Text:', fullText);
          console.log('🔄 Partial Text:', partialText);
          console.log('📍 Current Ayah:', currentAyahInRecitation + 1);
          
          // CRITICAL FIX: Use partial text if accumulated is empty!
          const textToMatch = fullText.length > 0 
            ? (fullText + ' ' + partialText).trim()
            : partialText;
            
          console.log('🎯 Text to Match:', textToMatch.substring(0, 80));
          console.log('📏 Text Length:', textToMatch.length);
          
          // Only process if we have enough text
          if (textToMatch.length < 3) {
            console.log('⏭️ Skipping: Text too short');
            return;
          }
          
          // Find the best matching ayah
          let bestMatch = { index: -1, accuracy: 0, verification: null as any };
          let allScores: any[] = [];
          
          sessionAyahs.forEach((ayah, index) => {
            const globalIndex = startIndex + index;
            const existingResult = sessionResults.get(globalIndex);
            
            const verification = verifyAyahRecitation(textToMatch, ayah.text);
            
            // Store all scores for debugging
            allScores.push({
              index: index + 1,
              accuracy: verification.accuracy,
              existing: existingResult?.accuracy || 0
            });
            
            // Track best match with LOWERED threshold (40 → 30) for better detection
            if (verification.accuracy > bestMatch.accuracy && verification.accuracy > 30) {
              bestMatch = { index, accuracy: verification.accuracy, verification };
            }
          });
          
          // Show all scores
          console.table(allScores);
          
          // Store the best match if found
          if (bestMatch.index >= 0 && bestMatch.verification) {
            const globalIndex = startIndex + bestMatch.index;
            const existingResult = sessionResults.get(globalIndex);
            
            // Update if:
            // 1. No existing result, OR
            // 2. Better accuracy, OR
            // 3. It's the next expected ayah (to catch progression)
            const isProgression = bestMatch.index === currentAyahInRecitation + 1;
            const isBetterMatch = !existingResult || bestMatch.accuracy > existingResult.accuracy;
            // LOWERED progression threshold (45 → 35) for better ayah detection
            const shouldUpdate = isBetterMatch || (isProgression && bestMatch.accuracy > 35);
            
            if (shouldUpdate) {
              console.log(`✅ MATCHED: Ayah ${bestMatch.index + 1} with ${bestMatch.accuracy.toFixed(1)}%`);
              console.log(`   Previous was: Ayah ${currentAyahInRecitation + 1}`);
              console.log(`   Is Progression: ${isProgression}`);
              
              setSessionResults(prev => {
                const newMap = new Map(prev);
                newMap.set(globalIndex, bestMatch.verification);
                return newMap;
              });
              setRecognizedTexts(prev => {
                const newMap = new Map(prev);
                newMap.set(globalIndex, textToMatch);
                return newMap;
              });
              setCurrentAyahInRecitation(bestMatch.index);
            } else {
              console.log(`⏸️ Not updating - current match at ${currentAyahInRecitation + 1} is better`);
            }
          } else {
            console.log('❌ No match found above threshold (40%)');
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
            {!isListening ? (
              <Button
                size="lg"
                onClick={handleStartListening}
                className="w-32 h-32 rounded-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isPlayingReference}
              >
                <Mic className="h-12 w-12" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleStopListening}
                className="w-32 h-32 rounded-full"
              >
                <Pause className="h-10 w-10" />
              </Button>
            )}

            {isListening && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-gray-900">Listening... Recite all 10 ayahs naturally</span>
                </div>
                <p className="text-sm text-gray-600">
                  Currently detecting: Ayah {currentAyahInRecitation + 1}
                </p>
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
