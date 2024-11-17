"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/app/components/ui/typewriter";
import { BackgroundBeams } from "@/app/components/ui/background-beams";

const words = [
  { text: "The" },
  { text: "first" },
  { text: "step" },
  { text: "to" },
  { text: "financial" },
  { text: "freedom." },
];

export default function Home() {
  const [fadeInTitle, setFadeInTitle] = useState(false);
  const [fadeInButton, setFadeInButton] = useState(false);
  const [fadeInText, setFadeInText] = useState(false);

  useEffect(() => {
    const titleTimer = setTimeout(() => setFadeInTitle(true), 500);
    const buttonTimer = setTimeout(() => setFadeInButton(true), 1000);
    const textTimer = setTimeout(() => setFadeInText(true), 1500);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(buttonTimer);
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <div className="w-full h-full snap-y snap-mandatory overflow-scroll">
      {/* Section 1 */}
      <section className="relative flex flex-col items-center justify-center h-screen bg-background text-foreground overflow-hidden snap-start">
        <BackgroundBeams className="z-0" />
        <div className="z-10 flex flex-col items-center justify-center space-y-6">
          <div className="h-8">
            <TypewriterEffectSmooth words={words} />
          </div>
          <h1
            className={`top-2 bottom-2 text-5xl font-bold text-center transition-opacity duration-1000 ${fadeInTitle ? "opacity-100" : "opacity-0"}`}
          >
            <span className="text-7xl text-blue-500 dark:text-blue-500">InvestIQ</span>
          </h1>
          <div className={`flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 transition-opacity duration-1000 ${fadeInButton ? "opacity-100" : "opacity-0"}`}>
            <Link href="/get-started">
              <button className="px-6 py-3 font-semibold rounded-lg !border-2 !border-solid border-foreground text-foreground hover:bg-accent hover:text-accent-foreground transition-colors hover:bg-foreground hover:text-background transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </div>
        <p className={`text-xs text-muted mt-10 z-10 text-center transition-opacity duration-1000 ${fadeInText ? "opacity-100" : "opacity-0"}`}>
          How are we different? ↓
        </p>
      </section>

      {/* Section 2, why are we better than gpt type */}
      <section className="h-screen flex items-center justify-center snap-start bg-primary text-primary-foreground">
        <h1 className="text-4xl font-bold">This is Page 2</h1>
      </section>
    </div>
  );
}