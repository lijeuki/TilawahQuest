'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { LiveRecognition, type LiveRecognitionResult } from '@/lib/audio/live-recognition';
import { AudioRecorder } from '@/lib/audio/recorder';
import { verifyAyahRecitation, mapWordsToOriginal, type VerificationResult } from '@/lib/quran/word-matcher';
import type { Ayah, Surah } from '@/types/quran';

interface AyahPracticeProps {
  surah: Surah;
  ayahs: Ayah[];
  onBack: () => void;
}

export function AyahPractice({ surah, ayahs, onBack }: AyahPracticeProps) {
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const liveRecognition = useRef<LiveRecognition>(new LiveRecognition());
  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());

  const currentAyah = ayahs[currentAyahIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    setError(null);
    setVerificationResult(null);
    setRecognizedText('');

    try {
      if (!liveRecognition.current.isSupported()) {
        throw new Error('Speech recognition not supported. Please use Chrome or Edge.');
      }

      await audioRecorder.current.startRecording();
      
      liveRecognition.current.start(
        (result: LiveRecognitionResult) => {
          if (result.isComplete) {
            // Final result - verify against current ayah
            const verification = verifyAyahRecitation(result.text, currentAyah.text);
            setVerificationResult(verification);
            setRecognizedText(result.text);
          }
        },
        (err) => {
          setError(err.message);
          setIsRecording(false);
        }
      );

      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    liveRecognition.current.stop();
    audioRecorder.current.stopRecording().catch(console.error);
    setIsRecording(false);
  };

  const handleNextAyah = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      setVerificationResult(null);
      setRecognizedText('');
    }
  };

  const handlePreviousAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(currentAyahIndex - 1);
      setVerificationResult(null);
      setRecognizedText('');
    }
  };

  const handleRetry = () => {
    setVerificationResult(null);
    setRecognizedText('');
    liveRecognition.current.reset();
  };

  // Word highlighting based on verification
  const highlightedWords = verificationResult 
    ? mapWordsToOriginal(currentAyah.text, verificationResult.wordMatches)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-gray-600">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Surahs
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{surah.englishName}</h2>
              <p className="text-sm text-gray-600" dir="rtl">{surah.name}</p>
            </div>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Ayah {currentAyahIndex + 1} of {ayahs.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentAyahIndex + 1) / ayahs.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentAyahIndex + 1) / ayahs.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Ayah Display */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-gray-900">
            Ayah {currentAyah.numberInSurah}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-3xl leading-relaxed" dir="rtl">
              {highlightedWords ? (
                highlightedWords.map((wordData, idx) => (
                  <span
                    key={idx}
                    className={`inline-block mx-1 px-1 rounded transition-colors ${
                      wordData.isCorrect
                        ? 'bg-green-100 text-green-900'
                        : wordData.confidence > 0
                        ? 'bg-red-100 text-red-900'
                        : ''
                    }`}
                  >
                    {wordData.word}
                  </span>
                ))
              ) : (
                currentAyah.text
              )}
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4">
            {isRecording ? (
              <>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="w-24 h-24 rounded-full"
                >
                  <Square className="h-10 w-10" />
                </Button>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-lg font-mono text-gray-900">{recordingTime}s</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Reciting... Speak clearly</p>
                </div>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={handleStartRecording}
                  disabled={!!verificationResult}
                  className="w-24 h-24 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Mic className="h-10 w-10" />
                </Button>
                <p className="text-sm text-gray-600">
                  {verificationResult ? 'Recording complete' : 'Click to start reciting'}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Verification Results */}
      {verificationResult && (
        <Card className={`border-2 ${verificationResult.isCorrect ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className={verificationResult.isCorrect ? 'text-green-700' : 'text-orange-700'}>
                {verificationResult.isCorrect ? '✓ Correct!' : '⚠ Needs Improvement'}
              </span>
              <span className="text-lg font-normal">
                Accuracy: {verificationResult.accuracy.toFixed(0)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mistakes Feedback */}
            {verificationResult.mistakes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Mistakes Found:</h4>
                <div className="space-y-2">
                  {verificationResult.mistakes.map((mistake, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Position {mistake.position + 1}: </span>
                        {mistake.type === 'wrong' && (
                          <>
                            <span className="text-red-600" dir="rtl">{mistake.received}</span>
                            <span className="text-gray-500"> → should be </span>
                            <span className="text-green-600" dir="rtl">{mistake.expected}</span>
                          </>
                        )}
                        {mistake.type === 'missing' && (
                          <>
                            <span className="text-red-600">Missing word: </span>
                            <span className="text-green-600" dir="rtl">{mistake.expected}</span>
                          </>
                        )}
                        {mistake.type === 'extra' && (
                          <>
                            <span className="text-red-600">Extra word: </span>
                            <span dir="rtl">{mistake.received}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="flex-1 border-gray-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {currentAyahIndex < ayahs.length - 1 && (
                <Button 
                  onClick={handleNextAyah}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next Ayah
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Reference Audio */}
            <Button variant="outline" className="w-full border-gray-300" disabled>
              <Volume2 className="h-4 w-4 mr-2" />
              Play Reference Audio (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousAyah}
          disabled={currentAyahIndex === 0}
          className="border-gray-300"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextAyah}
          disabled={currentAyahIndex === ayahs.length - 1}
          className="border-gray-300"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
