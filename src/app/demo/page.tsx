'use client';

import { ExamplePractice } from '@/components/demo/example-practice';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ExamplePractice onStartRealPractice={() => router.push('/practice')} />
      </div>
    </div>
  );
}
