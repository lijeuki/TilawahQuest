import type { Ayah, Surah } from '@/types/quran';
import { surahs } from '@/data/surahs';

// Placeholder - will be replaced with actual Quran data
let quranCache: { ayahs: Ayah[], surahs: Surah[] } | null = null;

export async function getQuranData() {
  if (quranCache) return quranCache;

  // TODO: Load actual Quran data from JSON file or API
  // For now, returning minimal structure
  quranCache = {
    ayahs: [], // Will be populated with actual data
    surahs: surahs
  };

  return quranCache;
}

export function getSurahByNumber(surahNumber: number): Surah | undefined {
  return surahs.find(s => s.number === surahNumber);
}

export function getAllSurahs(): Surah[] {
  return surahs;
}
