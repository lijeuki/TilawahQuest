'use client';

import { useState, useEffect } from 'react';
import { LiveRecorderComponent } from '@/components/audio/live-recorder';
import { SurahSelector } from '@/components/quran/surah-selector';
import { SessionPractice } from '@/components/quran/session-practice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Mic } from 'lucide-react';
import { getQuranData } from '@/lib/quran/data';
import type { Surah, Ayah } from '@/types/quran';

type PracticeMode = 'select' | 'free' | 'session';

export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>('select');
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
    setMode('session');
  };

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
  };

  const handleBackToSelect = () => {
    setMode('select');
    setSelectedSurah(null);
    setSurahAyahs([]);
  };

  if (mode === 'free') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setMode('select')} className="border-gray-300">
              ← Back to Mode Selection
            </Button>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Free Practice Mode</h1>
            <p className="text-gray-600">
              Recite any ayah and see real-time recognition
            </p>
          </div>

          <LiveRecorderComponent />

          <Card className="mt-6 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">How it works</CardTitle>
              <CardDescription className="text-gray-600">
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Click the microphone button to start</li>
                  <li>Start reciting any ayah from the Quran</li>
                  <li>Watch as the app recognizes your recitation in real-time</li>
                  <li>See the matching ayah and confidence score instantly</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'session' && selectedSurah && surahAyahs.length > 0) {
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

  // Mode selection
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Quran Recitation Practice</h1>
          <p className="text-gray-600">
            Choose your practice mode
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
          <Card 
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 hover:border-emerald-500 cursor-pointer transition-all group shadow-lg"
            onClick={() => setMode('select')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-12 w-12 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <CardTitle className="text-2xl text-gray-900">10-Ayah Sessions</CardTitle>
              <CardDescription className="text-gray-700 text-base">
                <span className="font-semibold text-emerald-700">Like Tarteel!</span> - Hands-free continuous recitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2 text-lg">✓</span>
                  <span><strong>Practice 10 ayahs</strong> at once - natural flow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2 text-lg">✓</span>
                  <span><strong>No button pressing</strong> - just speak!</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2 text-lg">✓</span>
                  <span><strong>Reference audio</strong> - listen then recite</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2 text-lg">✓</span>
                  <span><strong>Auto-detection</strong> - matches as you recite</span>
                </li>
              </ul>
              <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-lg py-6">
                Start 10-Ayah Sessions
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-2 border-gray-200 hover:border-teal-500 cursor-pointer transition-all group"
            onClick={() => setMode('free')}
          >
            <CardHeader>
              <Mic className="h-12 w-12 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-xl text-gray-900">Free Practice</CardTitle>
              <CardDescription className="text-gray-600">
                Recite any ayah freely with live recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  Recite any ayah from memory
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  Real-time recognition
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  Instant ayah identification
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  Quick confidence scoring
                </li>
              </ul>
              <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                Start Free Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Surah Selection (when mode is 'select') */}
        {mode === 'select' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Select a Surah</h2>
            <p className="text-center text-gray-600 mb-6">Choose any surah to practice 10 ayahs at a time</p>
            <SurahSelector onSelectSurah={handleSelectSurah} />
          </div>
        )}
      </div>
    </div>
  );
}
