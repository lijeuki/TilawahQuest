'use client';

import { BookOpen, Mic, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Practice', href: '/practice' },
  { label: 'About', href: '/about' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600">
              <span className="text-white font-bold text-xl">ت</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TilawahQuest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-emerald-600',
                  pathname === link.href
                    ? 'text-emerald-600'
                    : 'text-gray-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="border-gray-300">
              <Link href="/">Learn More</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/practice">Start Practice</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative flex size-8 rounded-sm border border-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <div className="absolute top-1/2 left-1/2 block w-4 -translate-x-1/2 -translate-y-1/2">
              <span
                className={cn(
                  'absolute block h-0.5 w-full rounded-full bg-gray-900 transition duration-300',
                  isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                )}
              />
              <span
                className={cn(
                  'absolute block h-0.5 w-full rounded-full bg-gray-900 transition duration-300',
                  isMenuOpen ? 'opacity-0' : ''
                )}
              />
              <span
                className={cn(
                  'absolute block h-0.5 w-full rounded-full bg-gray-900 transition duration-300',
                  isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-md transition-all duration-300 z-40',
          isMenuOpen
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-full opacity-0'
        )}
      >
        <div className="container px-4 py-6">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'text-lg font-medium transition-colors py-2',
                  pathname === link.href
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-emerald-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-8">
            <Button asChild variant="outline" className="w-full border-gray-300">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                Learn More
              </Link>
            </Button>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/practice" onClick={() => setIsMenuOpen(false)}>
                Start Practice
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
