'use client';

import { useState, useEffect } from 'react';
import { SurahSelector } from '@/components/quran/surah-selector';
import { SessionPractice } from '@/components/quran/session-practice';
import { getQuranData } from '@/lib/quran/data';
import type { Surah, Ayah } from '@/types/quran';

export default function PracticePage() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]);

  useEffect(() => {
    if (selectedSurah) {
      loadSurahAyahs(selectedSurah.number);
    }
  }, [selectedSurah]);

  const loadSurahAyahs = async (surahNumber: number) => {
    const data = await getQuranData();
    const ayahs = data.ayahs.filter(ayah => ayah.surah === surahNumber);
    setSurahAyahs(ayahs);
  };

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
  };

  const handleBackToSelect = () => {
    setSelectedSurah(null);
    setSurahAyahs([]);
  };

  // Show session practice if surah is selected
  if (selectedSurah && surahAyahs.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <SessionPractice 
            surah={selectedSurah} 
            ayahs={surahAyahs}
            onBack={handleBackToSelect}
          />
        </div>
      </div>
    );
  }

  // Show surah selection by default
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Select a Surah to Practice</h1>
          <p className="text-lg text-gray-600 mb-2">
            Practice 10 ayahs at a time with hands-free detection
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 mt-4">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">✓ Reference audio included</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">✓ Auto-detection</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">✓ Real-time feedback</span>
          </div>
        </div>

        <SurahSelector onSelectSurah={handleSelectSurah} />
      </div>
    </div>
  );
}
