/**
 * Live/Real-time speech recognition for Quran recitation
 * Similar to Tarteel's approach
 */

import { matchAyah } from '../quran/matcher';
import type { Ayah } from '@/types/quran';

export interface LiveRecognitionResult {
  text: string;
  partialText: string;
  matches: Array<{ ayah: Ayah; confidence: number }>;
  isComplete: boolean;
}

export class LiveRecognition {
  private recognition: any = null;
  private isActive = false;
  private onUpdate?: (result: LiveRecognitionResult) => void;
  private onError?: (error: Error) => void;
  private accumulatedText = '';
  private partialText = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    this.recognition.lang = 'ar-SA';
    this.recognition.continuous = true; // Enable continuous recognition
    this.recognition.interimResults = true; // Get partial results
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = async (event: any) => {
      let interim = '';
      let final = '';

      // Process all results - IMPORTANT: Process ALL results, not just from resultIndex
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // Only add to accumulated if not already there
          if (!this.accumulatedText.includes(transcript)) {
            final += transcript;
          }
        } else {
          interim += transcript;
        }
      }

      // Update accumulated text
      if (final) {
        this.accumulatedText = (this.accumulatedText + ' ' + final).trim();
        console.log('🎤 Final text added:', final);
        console.log('📚 Total accumulated:', this.accumulatedText);
      }
      this.partialText = interim;

      const fullText = (this.accumulatedText + ' ' + interim).trim();
      console.log('🔍 Full text for matching:', fullText.substring(0, 100));

      // Match against Quran database - lower threshold for faster detection
      if (fullText.length > 3) {
        const matches = await matchAyah(fullText);
        
        if (this.onUpdate) {
          this.onUpdate({
            text: this.accumulatedText.trim(),
            partialText: interim,
            matches,
            isComplete: false
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      // Ignore common non-critical errors
      const ignoredErrors = ['no-speech', 'aborted', 'audio-capture'];
      
      if (ignoredErrors.includes(event.error)) {
        console.log(`⚠️ Recognition: ${event.error} (this is normal, continuing...)`);
        return;
      }
      
      // Only report critical errors
      console.error('❌ Speech recognition error:', event.error);
      if (this.onError) {
        this.onError(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    this.recognition.onend = async () => {
      console.log('🛑 Recognition ended');
      
      // Restart if still supposed to be active (continuous mode)
      if (this.isActive) {
        console.log('🔄 Restarting recognition...');
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          this.isActive = false;
        }
      } else {
        // Final match when recognition truly ends
        if (this.accumulatedText && this.onUpdate) {
          const matches = await matchAyah(this.accumulatedText);
          this.onUpdate({
            text: this.accumulatedText.trim(),
            partialText: '',
            matches,
            isComplete: true
          });
        }
      }
    };
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(
    onUpdate: (result: LiveRecognitionResult) => void,
    onError?: (error: Error) => void
  ): void {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isActive) {
      return;
    }

    this.onUpdate = onUpdate;
    this.onError = onError;
    this.accumulatedText = '';
    this.partialText = '';
    this.isActive = true;

    try {
      this.recognition.start();
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }

  stop(): void {
    if (this.recognition && this.isActive) {
      this.recognition.stop();
    }
  }

  isRunning(): boolean {
    return this.isActive;
  }

  reset(): void {
    this.accumulatedText = '';
    this.partialText = '';
  }
}
