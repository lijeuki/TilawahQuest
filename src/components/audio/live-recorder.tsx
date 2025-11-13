'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveRecognition, type LiveRecognitionResult } from '@/lib/audio/live-recognition';
import { getSurahByNumber } from '@/lib/quran/data';
import { AudioRecorder } from '@/lib/audio/recorder';

export function LiveRecorderComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveRecognitionResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const liveRecognition = useRef<LiveRecognition>(new LiveRecognition());
  const audioRecorder = useRef<AudioRecorder>(new AudioRecorder());

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

  const handleStartLive = async () => {
    setError(null);
    setLiveResult(null);
    
    try {
      // Check browser support
      if (!liveRecognition.current.isSupported()) {
        throw new Error('Live recognition not supported in your browser. Please use Chrome or Edge.');
      }

      // Start audio recorder for recording (optional, for playback later)
      await audioRecorder.current.startRecording();
      
      // Start live recognition
      liveRecognition.current.start(
        (result) => {
          setLiveResult(result);
        },
        (err) => {
          setError(err.message);
          setIsRecording(false);
        }
      );

      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start live recognition');
    }
  };

  const handleStopLive = () => {
    liveRecognition.current.stop();
    audioRecorder.current.stopRecording().catch(console.error);
    setIsRecording(false);
  };

  const topMatch = liveResult?.matches[0];
  const surah = topMatch ? getSurahByNumber(topMatch.ayah.surah) : null;

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Live Recitation Practice</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 space-y-4">
          {isRecording ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStopLive}
              className="w-32 h-32 rounded-full"
            >
              <Square className="h-12 w-12" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleStartLive}
              className="w-32 h-32 rounded-full bg-primary hover:bg-primary/90"
            >
              <Mic className="h-12 w-12" />
            </Button>
          )}

          <div className="text-center">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-lg font-mono">{recordingTime}s</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Reciting... Keep going!
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click to start live recognition
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Live Results - showing what you're saying in real-time */}
      {isRecording && liveResult && (
        <Card className="border-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Recognition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Text Being Recognized */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                What we hear:
              </p>
              <p className="text-lg" dir="rtl">
                {liveResult.text}
                {liveResult.partialText && (
                  <span className="text-muted-foreground"> {liveResult.partialText}</span>
                )}
              </p>
            </div>

            {/* Best Match */}
            {topMatch && topMatch.confidence > 40 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    Detected: {surah?.englishName} - Ayah {topMatch.ayah.numberInSurah}
                  </p>
                  <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 px-2 py-1 rounded">
                    {topMatch.confidence.toFixed(0)}% match
                  </span>
                </div>
                <p className="text-xl leading-relaxed" dir="rtl">
                  {topMatch.ayah.text}
                </p>
              </div>
            )}

            {/* Confidence Indicator */}
            {topMatch && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span>{topMatch.confidence.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      topMatch.confidence > 80
                        ? 'bg-emerald-500'
                        : topMatch.confidence > 60
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, topMatch.confidence)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Results - shown after stopping */}
      {!isRecording && liveResult?.isComplete && topMatch && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Final Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                You recited:
              </p>
              <p className="text-2xl font-semibold mb-1">
                {surah?.englishName} - Ayah {topMatch.ayah.numberInSurah}
              </p>
              <p className="text-lg mb-2" dir="rtl">
                {surah?.name}
              </p>
              <p className="text-2xl leading-relaxed" dir="rtl">
                {topMatch.ayah.text}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Accuracy Score</span>
              <span className="text-2xl font-bold text-emerald-600">
                {topMatch.confidence.toFixed(1)}%
              </span>
            </div>

            {/* Audio Playback Option */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Listen to reference recitation:</p>
              <Button variant="outline" className="w-full" disabled>
                <Volume2 className="mr-2 h-4 w-4" />
                Play Reference Audio (Coming Soon)
              </Button>
            </div>

            {/* Other Matches */}
            {liveResult.matches.length > 1 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Other possible matches:
                </p>
                <div className="space-y-2">
                  {liveResult.matches.slice(1, 3).map((candidate, idx) => {
                    const candidateSurah = getSurahByNumber(candidate.ayah.surah);
                    return (
                      <div key={idx} className="text-sm p-2 bg-muted rounded">
                        <p className="font-medium">
                          {candidateSurah?.englishName} {candidate.ayah.numberInSurah}
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

            <Button onClick={() => {
              setLiveResult(null);
              liveRecognition.current.reset();
            }} className="w-full">
              Practice Another Ayah
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
