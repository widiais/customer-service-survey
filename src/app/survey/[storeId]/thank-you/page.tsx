'use client';

import { useParams } from 'next/navigation';
import { useStores } from '@/hooks/useStores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { stores } = useStores();
  
  const store = stores.find(s => s.id === storeId);
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Terima Kasih!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-gray-700">
            Survey Anda telah berhasil dikirim untuk <strong>{store?.name}</strong>
          </p>
          <p className="text-gray-600">
            Feedback Anda sangat berharga untuk membantu kami meningkatkan kualitas layanan.
          </p>
          
          <div className="flex justify-center items-center space-x-1 text-yellow-500 my-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 fill-current" />
            ))}
          </div>
          
          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-4">
              Ingin memberikan feedback lagi? Anda dapat mengisi survey kapan saja.
            </p>
            <Link href={`/survey/${storeId}`}>
              <Button variant="outline">Isi Survey Lagi</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}