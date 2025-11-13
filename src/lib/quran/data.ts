import type { Ayah, Surah } from '@/types/quran';
import { surahs } from '@/data/surahs';
import quranDataJson from '@/data/quran.json';

// Cache for Quran data
let quranCache: { ayahs: Ayah[], surahs: Surah[] } | null = null;

export async function getQuranData() {
  if (quranCache) return quranCache;

  // Load complete Quran data (6,236 ayahs)
  quranCache = {
    ayahs: quranDataJson.ayahs as Ayah[],
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
