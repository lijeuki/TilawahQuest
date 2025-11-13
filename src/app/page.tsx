import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            TilawahQuest
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Practice 10 ayahs at a time with hands-free detection - just like Tarteel!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/practice">
              <Button size="lg" className="text-lg px-8 py-6 bg-emerald-600 hover:bg-emerald-700">
                <Mic className="mr-2 h-5 w-5" />
                Start 10-Ayah Sessions
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-300">
                Watch Demo First
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✨ New: Continuous recitation • Reference audio • No button pressing needed
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <Mic className="h-12 w-12 text-emerald-600 mb-2" />
              <CardTitle className="text-gray-900">Record & Recognize</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Record your recitation and our AI will identify which ayah you&apos;re reciting with high accuracy
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-teal-600 mb-2" />
              <CardTitle className="text-gray-900">Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Get immediate feedback showing the correct Arabic text and pronunciation guidance
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-cyan-600 mb-2" />
              <CardTitle className="text-gray-900">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Monitor your practice sessions and see improvements in your recitation accuracy over time
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
          <div className="space-y-4">
            <Card className="bg-white border-gray-200">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Select a Surah</h3>
                  <p className="text-sm text-gray-600">
                    Choose any surah to practice - automatically divided into 10-ayah sessions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Listen to Reference Audio</h3>
                  <p className="text-sm text-gray-600">
                    Play the reference recitation for all 10 ayahs (optional but recommended)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Click Mic Once & Recite Continuously</h3>
                  <p className="text-sm text-gray-600">
                    No button pressing needed! Just recite all 10 ayahs naturally - auto-detects each one
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Review Session Results</h3>
                  <p className="text-sm text-gray-600">
                    See accuracy for all 10 ayahs at once with color-coded feedback
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/practice">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Try It Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
