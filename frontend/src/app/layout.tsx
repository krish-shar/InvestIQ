"use client";

import "./globals.css";
import { ThemeProvider } from "@/app/components/ui/theme-provider";
import { ModeToggle } from "@/app/components/ui/mode-toggle";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FloatingDock } from "@/app/components/ui/floating-dock";

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="relative scroll-smooth scroll-snap-y">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FloatingDock />
          {/* Dark mode toggle button */}
          <div className="fixed top-8 right-8 z-50">
            <ModeToggle />
          </div>
          <div className="snap-y snap-mandatory overflow-y-auto h-screen">
            <PageTransition>{children}</PageTransition>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}