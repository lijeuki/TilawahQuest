import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-emerald-600">
              <span className="text-white font-bold text-4xl">ت</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">About TilawahQuest</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Born from a personal need to practice Quran recitation daily
          </p>
        </div>

        {/* Our Story */}
        <Card className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
              <Heart className="h-8 w-8 text-emerald-600" />
              Our Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              TilawahQuest was created from a simple, personal need: <strong>the desire to practice Quran recitation daily</strong> 
              with proper feedback and guidance. As Muslims striving to maintain our connection with the Quran, 
              we often face challenges in finding the time, resources, or immediate feedback needed to improve our recitation.
            </p>
            <p>
              We realized that many brothers and sisters share this same struggle - the wish to recite more frequently, 
              to perfect our tajweed, and to build a consistent daily practice. Traditional methods, while valuable, 
              don't always fit into our busy modern lives.
            </p>
            <p className="font-semibold text-emerald-700">
              So we built TilawahQuest - not just as a product, but as a tool we genuinely needed for ourselves.
            </p>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <Card className="mb-8 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
              <BookOpen className="h-8 w-8 text-teal-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Our hope is that <strong>TilawahQuest will help you</strong> - and the entire Muslim community - 
              maintain a stronger, more consistent relationship with the Quran through:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-3 text-xl">•</span>
                <span><strong>Accessible practice</strong> - Anytime, anywhere, with just your device</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-3 text-xl">•</span>
                <span><strong>Instant feedback</strong> - Know immediately how you're doing</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-3 text-xl">•</span>
                <span><strong>Natural flow</strong> - Practice like you would recite naturally</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-3 text-xl">•</span>
                <span><strong>Reference audio</strong> - Learn from authentic recitations</span>
              </li>
            </ul>
            <p className="pt-4 text-gray-600 italic">
              "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" 
              <span className="block mt-2 text-sm">- Surah Al-Qamar (54:17)</span>
            </p>
          </CardContent>
        </Card>

        {/* Always Improving */}
        <Card className="mb-8 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
              <TrendingUp className="h-8 w-8 text-cyan-600" />
              Always Improving
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              We want to be transparent: <strong>TilawahQuest is a work in progress</strong>. We're constantly learning, 
              testing, and improving the experience. Some features might not be perfect yet, and that's okay.
            </p>
            <p>
              <strong className="text-emerald-600">InsyaAllah (God willing)</strong>, we will continue to enhance this tool 
              day by day, listening to your feedback and adding features that truly help the community.
            </p>
            <p className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <strong>Our commitment:</strong> Keep improving, keep listening, and keep building something that genuinely 
              serves the Muslim community's needs. Your patience and feedback are invaluable to us.
            </p>
          </CardContent>
        </Card>

        {/* Community */}
        <Card className="mb-12 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
              <Users className="h-8 w-8 text-purple-600" />
              Built for the Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              TilawahQuest is built <strong>for Muslims, by Muslims</strong>. We understand the importance of Quran 
              recitation in our daily lives because we live it too.
            </p>
            <p>
              Every feature we add, every improvement we make, comes from asking ourselves: 
              <em className="text-emerald-600"> "Would this help me practice better? Would this help my family? Would this 
              help my brothers and sisters in Islam?"</em>
            </p>
            <p>
              If the answer is yes, we build it. <strong>InsyaAllah</strong>, together we can make Quran practice more 
              accessible and consistent for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Acknowledgments */}
        <Card className="mb-12 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Acknowledgments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <strong>Quran Dataset:</strong> Special thanks to{' '}
              <a 
                href="https://www.tarteel.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                Tarteel AI
              </a>
              {' '}for their incredible work in Quran technology and inspiration.
            </p>
            <p>
              <strong>Audio Recitations:</strong> Reference audio provided by{' '}
              <a 
                href="https://everyayah.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                EveryAyah.com
              </a>
              {' '}(Mishary Rashid Alafasy).
            </p>
            <p>
              <strong>Quran Text:</strong> From{' '}
              <a 
                href="https://alquran.cloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                AlQuran Cloud API
              </a>
              .
            </p>
            <p className="pt-4 text-sm text-gray-600">
              May Allah reward all those who contribute to making Quran knowledge and practice more accessible.
            </p>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-700">
            Ready to start your Quran practice journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/practice">
              <Button size="lg" className="text-lg px-8 py-6 bg-emerald-600 hover:bg-emerald-700">
                Start Practicing Now
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-300">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-8">
            Have feedback or suggestions? We'd love to hear from you!<br />
            Connect with us on{' '}
            <a 
              href="https://www.linkedin.com/in/rizkkkky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              LinkedIn
            </a>
          </p>
          <p className="text-xl font-arabic text-emerald-600 mt-8">
            بارك الله فيكم
          </p>
          <p className="text-sm text-gray-600">
            (May Allah bless you)
          </p>
        </div>
      </div>
    </div>
  );
}
