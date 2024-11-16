import './globals.css';
import ThemeToggle from '@/app/components/ui/ThemeToggle';

export const metadata = {
  title: 'InvestIQ',
  description: 'Intelligent Financial Insights Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground dark:bg-background-light dark:text-foreground-light">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
