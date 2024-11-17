"use client";
import React from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/app/components/ui/typewriter";
import { BackgroundBeams } from "@/app/components/ui/background-beams";

const words = [
  { text: "InvestIQ", className: "text-blue-500 dark:text-blue-500" },
];

export default function Home() {
  return (
    <div className="w-full h-full snap-y snap-mandatory overflow-scroll">
      {/* Section 1 */}
      <section className="relative flex flex-col items-center justify-center h-screen bg-background text-foreground overflow-hidden snap-start">
        <BackgroundBeams className="z-0" />
        <div className="z-10 flex flex-col items-center justify-center space-y-6">
          <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base text-center">
            The first step to financial freedom.
          </p>
          <h1 className="text-5xl font-bold text-center">
            <TypewriterEffectSmooth words={words} />
          </h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/get-started">
              <button className="px-6 py-3 font-semibold rounded-lg border-2 border-foreground text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </div>
        <p className="text-xs text-muted mt-10 z-10 text-center">
          How are we different? ↓
        </p>
      </section>

      {/* Section 2 */}
      <section className="h-screen flex items-center justify-center snap-start bg-primary text-primary-foreground">
        <h1 className="text-4xl font-bold">This is Page 2</h1>
      </section>

      {/* Section 3 */}
      <section className="h-screen flex items-center justify-center snap-start bg-secondary text-secondary-foreground">
        <h1 className="text-4xl font-bold">Explore Page 3</h1>
      </section>
    </div>
  );
}
