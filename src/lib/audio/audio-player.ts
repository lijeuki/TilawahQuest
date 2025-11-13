/**
 * Audio player for reference Quran recitations
 * Supports EveryAyah.com API and local audio files
 */

export class QuranAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentAyah: { surah: number; ayah: number } | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
    }
  }

  /**
   * Get audio URL for specific ayah from EveryAyah.com
   * Reciter: Mishary Rashid Alafasy (high quality)
   */
  getAudioUrl(surahNumber: number, ayahNumber: number, reciter: string = 'Alafasy_128kbps'): string {
    const surah = String(surahNumber).padStart(3, '0');
    const ayah = String(ayahNumber).padStart(3, '0');
    
    // EveryAyah.com format: https://everyayah.com/data/reciter_name/surah_ayah.mp3
    return `https://everyayah.com/data/${reciter}/${surah}${ayah}.mp3`;
  }

  /**
   * Play reference audio for specific ayah
   */
  async playAyah(surahNumber: number, ayahNumber: number, reciter?: string): Promise<void> {
    if (!this.audio) {
      throw new Error('Audio player not initialized');
    }

    try {
      const url = this.getAudioUrl(surahNumber, ayahNumber, reciter);
      this.audio.src = url;
      this.currentAyah = { surah: surahNumber, ayah: ayahNumber };
      
      await this.audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Failed to play reference audio. Please check your internet connection.');
    }
  }

  /**
   * Play multiple ayahs in sequence (for 10 ayah sessions)
   */
  async playAyahSequence(
    ayahs: Array<{ surah: number; ayah: number }>,
    reciter?: string,
    onAyahStart?: (index: number) => void
  ): Promise<void> {
    for (let i = 0; i < ayahs.length; i++) {
      onAyahStart?.(i);
      await this.playAyah(ayahs[i].surah, ayahs[i].ayah, reciter);
      
      // Wait for current ayah to finish
      await new Promise((resolve) => {
        if (this.audio) {
          this.audio.onended = () => resolve(null);
        }
      });

      // Small pause between ayahs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.audio?.pause();
  }

  /**
   * Resume playback
   */
  resume(): void {
    this.audio?.play();
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.currentAyah = null;
    }
  }

  /**
   * Set playback speed (0.5x, 0.75x, 1x)
   */
  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  /**
   * Get current playback position
   */
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  /**
   * Get audio duration
   */
  getDuration(): number {
    return this.audio?.duration || 0;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    this.audio = null;
  }
}
