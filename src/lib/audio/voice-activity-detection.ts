/**
 * Voice Activity Detection (VAD)
 * Automatically detects when user is speaking without needing to press buttons
 */

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private isActive = false;
  private threshold = 0.01; // Voice detection threshold
  
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onVolumeChange?: (volume: number) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Start voice activity detection
   */
  async start(
    callbacks: {
      onSpeechStart?: () => void;
      onSpeechEnd?: () => void;
      onVolumeChange?: (volume: number) => void;
    }
  ): Promise<void> {
    this.onSpeechStart = callbacks.onSpeechStart;
    this.onSpeechEnd = callbacks.onSpeechEnd;
    this.onVolumeChange = callbacks.onVolumeChange;

    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!this.audioContext) {
        throw new Error('AudioContext not available');
      }

      // Set up audio analysis
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      this.isActive = true;
      this.detectVoice();
    } catch (error) {
      console.error('Error starting VAD:', error);
      throw new Error('Failed to access microphone for voice detection');
    }
  }

  /**
   * Main voice detection loop
   */
  private detectVoice(): void {
    if (!this.isActive || !this.analyser) return;

    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    
    const checkVolume = () => {
      if (!this.isActive || !this.analyser) return;

      this.analyser.getFloatTimeDomainData(dataArray);

      // Calculate RMS (Root Mean Square) for volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Notify volume change
      this.onVolumeChange?.(rms);

      // Detect speech based on threshold
      if (rms > this.threshold) {
        this.onSpeechStart?.();
      } else {
        this.onSpeechEnd?.();
      }

      this.rafId = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  /**
   * Set sensitivity threshold (lower = more sensitive)
   */
  setThreshold(threshold: number): void {
    this.threshold = Math.max(0.001, Math.min(0.1, threshold));
  }

  /**
   * Stop voice activity detection
   */
  stop(): void {
    this.isActive = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }
  }

  /**
   * Check if VAD is currently active
   */
  isRunning(): boolean {
    return this.isActive;
  }
}
