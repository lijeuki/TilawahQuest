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

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Update accumulated text
      if (final) {
        this.accumulatedText += ' ' + final;
        console.log('🎤 Final text added:', final);
      }
      this.partialText = interim;

      const fullText = (this.accumulatedText + ' ' + interim).trim();

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
      if (this.onError) {
        this.onError(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    this.recognition.onend = async () => {
      // Final match when recognition ends
      if (this.accumulatedText && this.onUpdate) {
        const matches = await matchAyah(this.accumulatedText);
        this.onUpdate({
          text: this.accumulatedText.trim(),
          partialText: '',
          matches,
          isComplete: true
        });
      }
      
      this.isActive = false;
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
