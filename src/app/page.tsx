'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show anything if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Labbaik Chicken
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistem Manajemen Pelanggan
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg">
              Login Administrator
            </Button>
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Untuk mengisi survei pelanggan, scan QR code di toko
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
