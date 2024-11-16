"use client";
import React from 'react';
import Link from 'next/link';
import { TypewriterEffectSmooth } from '@/app/components/ui/typewriter';
import { BackgroundBeams } from '@/app/components/ui/background-beams';

const words = [
  { text: 'InvestIQ', className: 'text-blue-500 dark:text-blue-500' },
];

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-background text-foreground overflow-hidden">
      <BackgroundBeams className="z-0" />
      <div className="z-10 flex flex-col items-center justify-center space-y-6">
        <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base text-center">
          The road to freedom starts from here
        </p>
        <h1 className="text-5xl font-bold text-center">
          <TypewriterEffectSmooth words={words} />
        </h1>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/get-started">
            <button className="w-40 h-10 rounded-xl bg-primary text-foreground hover:bg-accent-light dark:bg-primary-light dark:text-foreground-light hover:dark:bg-accent">
              Get Started
            </button>
          </Link>
          <button className="w-40 h-10 rounded-xl bg-secondary text-foreground border border-foreground">
            Learn More
          </button>
        </div>
      </div>
      <p className="text-xs text-muted mt-10 z-10 text-center">How are we different? ↓</p>
    </div>
  );
}
