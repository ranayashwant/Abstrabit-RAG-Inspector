import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Abstrabit RAG Inspector',
  description: 'Developer-focused RAG pipeline debugging & inspection prototype',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-white dark:bg-[#010614] text-[#020817] dark:text-[#f8fafc] transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
