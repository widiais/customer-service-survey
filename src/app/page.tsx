import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
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
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg">
              Admin Dashboard
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
