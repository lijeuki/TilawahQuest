/**
 * Web Speech API wrapper for Arabic speech recognition
 */

export class SpeechRecognizer {
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia)
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  async recognizeFromBlob(audioBlob: Blob): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        URL.revokeObjectURL(audio.src);
      };

      // Start recognition
      audio.play();
      this.recognition.start();
    });
  }

  /**
   * Recognize speech from microphone in real-time
   */
  async recognizeFromMicrophone(): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
