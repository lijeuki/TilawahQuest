import { calculateSimilarity, containsKeyWords } from './text-processor';
import type { Ayah, RecognitionResult } from '@/types/quran';
import { getQuranData } from './data';

export interface MatchCandidate {
  ayah: Ayah;
  confidence: number;
}

/**
 * Find matching ayahs from recognized text
 * Returns top 3 candidates with confidence scores
 */
export async function matchAyah(recognizedText: string): Promise<MatchCandidate[]> {
  const quranData = await getQuranData();
  const candidates: MatchCandidate[] = [];

  // Search through all ayahs
  for (const ayah of quranData.ayahs) {
    const similarity = calculateSimilarity(recognizedText, ayah.text);
    const hasKeyWords = containsKeyWords(recognizedText, ayah.text);

    // Boost score if key words are found
    const confidence = hasKeyWords ? Math.min(100, similarity + 10) : similarity;

    if (confidence > 30) { // Minimum threshold
      candidates.push({ ayah, confidence });
    }
  }

  // Sort by confidence and return top 3
  return candidates
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

/**
 * Find ayah by surah and ayah number
 */
export async function getAyahByReference(surahNumber: number, ayahNumber: number): Promise<Ayah | null> {
  const quranData = await getQuranData();
  return quranData.ayahs.find(
    ayah => ayah.surah === surahNumber && ayah.numberInSurah === ayahNumber
  ) || null;
}
