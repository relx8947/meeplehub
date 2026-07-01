import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeepleHub - 桌游约局平台',
  description: '发现桌游约局、探索新游戏、结识同好玩家。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-900 text-gray-400 py-8">
              <div className="container mx-auto px-4 text-center">
                <p>MeepleHub · 桌游约局平台</p>
                <p className="text-sm mt-2">相聚 · 开局 · 尽兴</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
