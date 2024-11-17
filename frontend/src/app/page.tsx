"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/app/components/ui/typewriter";
import { BackgroundBeams } from "@/app/components/ui/background-beams";
import { motion, useAnimation } from "framer-motion";
import { FaFileAlt, FaYahoo, FaTwitter, FaNewspaper } from "react-icons/fa";

const words = [
  { text: "The" },
  { text: "first" },
  { text: "step" },
  { text: "to" },
  { text: "financial" },
  { text: "freedom." },
];

const dataSources = [
  { icon: FaFileAlt, text: "SEC Filings" },
  { icon: FaNewspaper, text: "Financial News" },
  { icon: FaYahoo, text: "Yahoo Finance" },
  { icon: FaTwitter, text: "Twitter" },
];

export default function Home() {
  const [fadeInTitle, setFadeInTitle] = useState(false);
  const [fadeInButton, setFadeInButton] = useState(false);
  const [fadeInText, setFadeInText] = useState(false);
  const secondSectionRef = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    const titleTimer = setTimeout(() => setFadeInTitle(true), 500);
    const buttonTimer = setTimeout(() => setFadeInButton(true), 1000);
    const textTimer = setTimeout(() => setFadeInText(true), 1500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
        }
      },
      { threshold: 0.3 }
    );

    if (secondSectionRef.current) {
      observer.observe(secondSectionRef.current);
    }

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(buttonTimer);
      clearTimeout(textTimer);
      if (secondSectionRef.current) {
        observer.unobserve(secondSectionRef.current);
      }
    };
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full h-screen snap-y snap-mandatory overflow-y-scroll">
      {/* Section 1 */}
      <section className="relative flex flex-col items-center justify-between h-screen bg-background text-foreground overflow-hidden snap-start py-12">
        <BackgroundBeams className="z-0" />
        <div className="z-10 flex flex-col items-center justify-center space-y-6 flex-grow">
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
              <button className="px-6 py-3 font-semibold rounded-lg border-2 border-solid border-foreground text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </div>
        <p className={`text-lg font-semibold text-muted z-10 text-center transition-opacity duration-1000 ${fadeInText ? "opacity-100" : "opacity-0"}`}>
          How are we better? ↓
        </p>
      </section>

      {/* Section 2: What makes us different */}
      <section ref={secondSectionRef} className="h-screen flex flex-col items-center justify-start pt-20 snap-start bg-background text-primary">
        <motion.h2 
          variants={variants}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl font-bold mb-12 text-center"
        >
          We are different because:
        </motion.h2>
        <motion.h3
          variants={variants}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-3xl font-normal mb-8 text-center"
        >
          Our data comes from:
        </motion.h3>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          {dataSources.map((source, index) => (
            <motion.div
              key={source.text}
              variants={variants}
              initial="hidden"
              animate={controls}
              transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
              className="flex flex-col items-center"
            >
              <source.icon className="text-5xl mb-2" />
              <p className="text-sm font-extralight text-center">{source.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.h3
          variants={variants}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.8, delay: 2 }}
          className="text-3xl font-normal text-center"
        >
          Our app writes code, and fixes it itself!
        </motion.h3>
      </section>
    </div>
  );
}
