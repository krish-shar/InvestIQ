import "./globals.css";
import { ThemeProvider } from "@/app/components/ui/theme-provider";
import { ModeToggle } from "@/app/components/ui/mode-toggle";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="relative scroll-smooth scroll-snap-y">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Dark mode toggle button */}
          <div className="fixed top-4 right-4 z-20">
            <ModeToggle />
          </div>
          <div className="snap-y snap-mandatory overflow-y-auto h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
