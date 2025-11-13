'use client';

import { useState } from 'react';
import { AudioRecorderComponent } from '@/components/audio/audio-recorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeechRecognizer } from '@/lib/audio/speech-recognition';
import { matchAyah } from '@/lib/quran/matcher';
import { getSurahByNumber } from '@/lib/quran/data';
import type { AudioRecording } from '@/types/quran';
import { Loader2 } from 'lucide-react';

export default function PracticePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (recording: AudioRecording) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      // Step 1: Convert audio to text using Web Speech API
      const recognizer = new SpeechRecognizer();
      
      if (!recognizer.isSupported()) {
        throw new Error('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      }

      const recognizedText = await recognizer.recognizeFromBlob(recording.blob);
      console.log('Recognized text:', recognizedText);

      // Step 2: Match against Quran database
      const candidates = await matchAyah(recognizedText);

      if (candidates.length === 0) {
        setError('Could not match any ayah. Please try reciting more clearly.');
        return;
      }

      // Get the best match
      const bestMatch = candidates[0];
      const surah = getSurahByNumber(bestMatch.ayah.surah);

      setResults({
        recognizedText,
        bestMatch,
        surah,
        allCandidates: candidates
      });

    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Practice Recitation</h1>
        <p className="text-muted-foreground">
          Record your Quran recitation and get instant feedback
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Record Your Recitation</CardTitle>
          <CardDescription>
            Recite any ayah from the Quran. The app will identify which ayah you&apos;re reciting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <AudioRecorderComponent
            onRecordingComplete={handleRecordingComplete}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Processing your recitation...</p>
            <p className="text-sm text-muted-foreground">This may take a few seconds</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive mb-2">Error</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recognition Results</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Confidence: {results.bestMatch.confidence.toFixed(1)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    What we heard:
                  </p>
                  <p className="text-lg" dir="rtl">{results.recognizedText}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Identified Ayah:
                  </p>
                  <p className="text-xl font-semibold mb-1">
                    {results.surah?.englishName} - Ayah {results.bestMatch.ayah.numberInSurah}
                  </p>
                  <p className="text-lg mb-2" dir="rtl">
                    {results.surah?.name}
                  </p>
                  <p className="text-2xl leading-relaxed" dir="rtl">
                    {results.bestMatch.ayah.text}
                  </p>
                </div>

                {results.allCandidates.length > 1 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Other possible matches:
                    </p>
                    <div className="space-y-2">
                      {results.allCandidates.slice(1).map((candidate: any, idx: number) => {
                        const surah = getSurahByNumber(candidate.ayah.surah);
                        return (
                          <div key={idx} className="text-sm p-2 bg-muted rounded">
                            <p className="font-medium">
                              {surah?.englishName} {candidate.ayah.numberInSurah} 
                              <span className="text-muted-foreground ml-2">
                                ({candidate.confidence.toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setResults(null)}>
              Record Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
