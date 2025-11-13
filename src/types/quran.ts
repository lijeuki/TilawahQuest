export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface AyahAttempt {
  id: string;
  sessionId: string;
  surahNumber: number;
  ayahNumber: number;
  recognizedText: string;
  confidenceScore: number;
  audioUrl?: string;
  createdAt: string;
}

export interface RecognitionResult {
  ayah: Ayah;
  surah: Surah;
  confidenceScore: number;
  recognizedText: string;
}

export interface AudioRecording {
  blob: Blob;
  duration: number;
  mimeType: string;
}
