'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllSurahs } from '@/lib/quran/data';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { Surah } from '@/types/quran';

interface SurahSelectorProps {
  onSelectSurah: (surah: Surah) => void;
}

export function SurahSelector({ onSelectSurah }: SurahSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const surahs = getAllSurahs();

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name.includes(searchTerm) ||
    surah.number.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Select a Surah</CardTitle>
          <CardDescription className="text-gray-600">
            Choose a surah to practice recitation ayah by ayah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Search surah by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />

          <div className="grid gap-2 max-h-[500px] overflow-y-auto">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => onSelectSurah(surah)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">
                      {surah.englishName}
                    </h3>
                    <p className="text-sm text-gray-600" dir="rtl">
                      {surah.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {surah.numberOfAyahs} ayahs • {surah.revelationType}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Surahs Quick Access */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Popular Surahs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[1, 2, 18, 36, 55, 67].map((num) => {
              const surah = surahs.find(s => s.number === num);
              if (!surah) return null;
              return (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => onSelectSurah(surah)}
                  className="justify-start border-gray-200 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-600" />
                  <span className="text-gray-900">{surah.englishName}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
