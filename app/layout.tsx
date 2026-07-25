'use client';

import React, { useState } from 'react';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Terminal } from '../components/Terminal';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // If on landing page, display fullscreen content without dashboard sidebar/navbar
  const isLandingPage = pathname === '/';

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}>
      <body className="antialiased bg-background text-text-primary min-h-screen flex flex-col">
        {isLandingPage ? (
          <main className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
        ) : (
          <div className="flex-1 flex overflow-hidden h-screen">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A] relative">
              {/* Top Navbar */}
              <Navbar />

              {/* Page Content Viewport */}
              <main className="flex-1 overflow-y-auto p-6 min-h-0 bg-background relative border-t border-border">
                {children}
              </main>

              {/* Bottom Docked Terminal */}
              <Terminal />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
