import type { AudioRecording } from '@/types/quran';

const MAX_RECORDING_TIME = 30000; // 30 seconds in milliseconds

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingTimer: NodeJS.Timeout | null = null;
  
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Use WebM with Opus codec (best compression)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();

      // Auto-stop after 30 seconds
      this.recordingTimer = setTimeout(() => {
        this.stopRecording();
      }, MAX_RECORDING_TIME);

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Could not start audio recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder!.mimeType });
        const recording: AudioRecording = {
          blob,
          duration: 0, // TODO: Calculate actual duration
          mimeType: this.mediaRecorder!.mimeType
        };

        // Clean up
        this.cleanup();
        resolve(recording);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
