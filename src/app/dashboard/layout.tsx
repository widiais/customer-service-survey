'use client';

import { Navigation, MobileMenuButton } from '@/components/admin/navigation';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MobileMenuButton onClick={toggleMobileMenu} />
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen} 
        onMobileMenuToggle={toggleMobileMenu} 
      />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}