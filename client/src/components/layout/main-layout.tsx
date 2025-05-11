import React, { ReactNode } from 'react';
import { Navbar } from './navbar';

interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}