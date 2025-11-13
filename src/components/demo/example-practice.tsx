'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { AyahPractice } from '@/components/quran/ayah-practice';
import type { Surah, Ayah } from '@/types/quran';

// Example ayah for demo (Al-Fatihah, Ayah 1)
const DEMO_AYAH: Ayah = {
  number: 1,
  text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  numberInSurah: 1,
  juz: 1,
  page: 1,
  surah: 1
};

const DEMO_SURAH: Surah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan'
};

// Demo scenarios showing different accuracy levels
const DEMO_SCENARIOS = [
  {
    id: 'perfect',
    title: 'Perfect Match (100%)',
    description: 'All words pronounced correctly',
    recitedText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    accuracy: 100,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500'
  },
  {
    id: 'good',
    title: 'Good Match (85%)',
    description: 'One word slightly off',
    recitedText: 'بِسْمِ اللَّهِ الرَّحْمَن الرَّحِيمِ',
    accuracy: 85,
    icon: CheckCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500'
  },
  {
    id: 'needs-work',
    title: 'Needs Improvement (60%)',
    description: 'Missing or wrong words',
    recitedText: 'بِسْمِ اللَّهِ الرَّحِيمِ',
    accuracy: 60,
    icon: XCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500'
  }
];

interface ExamplePracticeProps {
  onStartRealPractice: () => void;
}

export function ExamplePractice({ onStartRealPractice }: ExamplePracticeProps) {
  const [step, setStep] = useState<'intro' | 'demo' | 'ready'>('intro');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        {/* Introduction */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              👋 Welcome to TilawahQuest!
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Let's show you how our AI-powered recognition works with a quick demo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-2">How It Works:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs flex-shrink-0">1</span>
                  <span>Listen to the correct pronunciation of an ayah</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs flex-shrink-0">2</span>
                  <span>Record yourself reciting the same ayah</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs flex-shrink-0">3</span>
                  <span>Get instant word-by-word feedback with color highlighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs flex-shrink-0">4</span>
                  <span>See exactly which words need improvement</span>
                </li>
              </ol>
            </div>

            <Button 
              onClick={() => setStep('demo')} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              See Demo Examples
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Reference Ayah */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Example Ayah: Al-Fatihah (1:1)</CardTitle>
            <CardDescription className="text-gray-600">
              We'll use the opening verse of the Quran for this demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl leading-relaxed mb-4" dir="rtl">
                {DEMO_AYAH.text}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                "In the name of Allah, the Most Gracious, the Most Merciful"
              </p>
              <Button variant="outline" className="border-gray-300" disabled>
                <Volume2 className="mr-2 h-4 w-4" />
                Play Reference Audio (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'demo') {
    return (
      <div className="space-y-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Demo: Recognition Examples</CardTitle>
            <CardDescription className="text-gray-600">
              See how different recitations are evaluated. Click on each example to see the results.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Reference Text */}
        <Card className="bg-gray-50 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Correct Text:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-center leading-relaxed" dir="rtl">
              {DEMO_AYAH.text}
            </p>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="grid gap-4">
          {DEMO_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario === scenario.id;
            
            return (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? `${scenario.bgColor} border-2 ${scenario.borderColor}` 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${scenario.color}`} />
                      <div>
                        <CardTitle className="text-lg text-gray-900">{scenario.title}</CardTitle>
                        <CardDescription className="text-gray-600">{scenario.description}</CardDescription>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${scenario.color}`}>
                      {scenario.accuracy}%
                    </div>
                  </div>
                </CardHeader>
                
                {isSelected && (
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">What was recited:</p>
                      <p className="text-2xl text-center leading-relaxed" dir="rtl">
                        {scenario.recitedText}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Word-by-word analysis:</p>
                      <div className="space-y-2 text-sm">
                        {scenario.accuracy === 100 && (
                          <p className="text-green-600">✓ All words are correct! Perfect pronunciation.</p>
                        )}
                        {scenario.accuracy === 85 && (
                          <div className="space-y-1">
                            <p className="text-green-600">✓ Word 1: بِسْمِ - Correct</p>
                            <p className="text-green-600">✓ Word 2: اللَّهِ - Correct</p>
                            <p className="text-yellow-600">⚠ Word 3: الرَّحْمَن - Slightly different (expected: الرَّحْمَٰنِ)</p>
                            <p className="text-green-600">✓ Word 4: الرَّحِيمِ - Correct</p>
                          </div>
                        )}
                        {scenario.accuracy === 60 && (
                          <div className="space-y-1">
                            <p className="text-green-600">✓ Word 1: بِسْمِ - Correct</p>
                            <p className="text-green-600">✓ Word 2: اللَّهِ - Correct</p>
                            <p className="text-red-600">✗ Word 3: الرَّحْمَٰنِ - Missing</p>
                            <p className="text-green-600">✓ Word 3: الرَّحِيمِ - Correct</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setStep('intro')}
            className="flex-1 border-gray-300"
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep('ready')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            I Understand, Let's Practice!
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'ready') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              🎉 Ready to Start!
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              You now understand how the recognition works. Choose how you'd like to practice:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white border-emerald-200 hover:border-emerald-500 cursor-pointer transition-all">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Practice This Ayah
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Try reciting Al-Fatihah 1:1 yourself
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      // Stay on this ayah for practice
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Practice Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-teal-200 hover:border-teal-500 cursor-pointer transition-all">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Choose Different Surah
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Select from 114 surahs to practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={onStartRealPractice}
                    variant="outline"
                    className="w-full border-teal-300 hover:bg-teal-50"
                  >
                    Browse Surahs
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-emerald-600">💡</span> Pro Tips:
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Use a quiet environment for best results</li>
                <li>• Green highlights = correct, Red = needs improvement</li>
                <li>• Aim for 90%+ accuracy before moving to next ayah</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
