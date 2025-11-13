'use client';

import { useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from '@/lib/audio/recorder';
import type { AudioRecording } from '@/types/quran';

interface AudioRecorderProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  onRecordingStart?: () => void;
  disabled?: boolean;
}

export function AudioRecorderComponent({ 
  onRecordingComplete, 
  onRecordingStart,
  disabled = false 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recorder] = useState(() => new AudioRecorder());
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    // Check permission on mount
    recorder.requestPermission().then(setHasPermission);

    return () => {
      recorder.cleanup();
    };
  }, [recorder]);

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
    try {
      await recorder.startRecording();
      setIsRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const recording = await recorder.stopRecording();
      setIsRecording(false);
      setRecordingTime(0);
      onRecordingComplete(recording);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground mb-4">
          Microphone permission is required to record your recitation.
        </p>
        <Button onClick={() => recorder.requestPermission().then(setHasPermission)}>
          Grant Permission
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording ? (
        <Button
          size="lg"
          variant="destructive"
          onClick={handleStopRecording}
          className="w-32 h-32 rounded-full"
        >
          <Square className="h-12 w-12" />
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={handleStartRecording}
          disabled={disabled || hasPermission === null}
          className="w-32 h-32 rounded-full bg-primary hover:bg-primary/90"
        >
          {hasPermission === null ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </Button>
      )}

      <div className="text-center">
        {isRecording ? (
          <>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-lg font-mono">{recordingTime}s / 30s</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Recording... Click stop when done
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click to start recording (max 30 seconds)
          </p>
        )}
      </div>
    </div>
  );
}
