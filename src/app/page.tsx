import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            TilawahQuest
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Improve your Quran recitation with AI-powered recognition and instant feedback
          </p>
          <Link href="/practice">
            <Button size="lg" className="text-lg px-8 py-6">
              <Mic className="mr-2 h-5 w-5" />
              Start Practicing
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <Mic className="h-12 w-12 text-emerald-600 mb-2" />
              <CardTitle>Record & Recognize</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Record your recitation and our AI will identify which ayah you&apos;re reciting with high accuracy
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-teal-600 mb-2" />
              <CardTitle>Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get immediate feedback showing the correct Arabic text and pronunciation guidance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-cyan-600 mb-2" />
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your practice sessions and see improvements in your recitation accuracy over time
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Click to Record</h3>
                  <p className="text-sm text-muted-foreground">
                    Grant microphone permission and click the record button
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recite Any Ayah</h3>
                  <p className="text-sm text-muted-foreground">
                    Recite any verse from the Quran clearly (up to 30 seconds)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Results</h3>
                  <p className="text-sm text-muted-foreground">
                    See the identified ayah, confidence score, and correct Arabic text
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
