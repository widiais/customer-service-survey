'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SurveyProgress } from '@/components/survey/progress';
import { ArrowLeft } from 'lucide-react';

const timeOptions = ['Pagi', 'Siang', 'Sore', 'Malam'];
const orderingMethods = ['Datang Langsung', 'Go Food', 'Grab Food', 'Shopee Food'];

export default function SurveyStep3({ params }: { params: Promise<{ storeId: string }> }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    preferredTimeToBuy: '',
    orderingMethod: '',
    favoriteMenu: '',
    loyaltyFactors: '',
    hasRecommendedBrand: false
  });

  useEffect(() => {
    const checkSavedData = async () => {
      const savedData = localStorage.getItem('surveyData');
      if (!savedData) {
        const resolvedParams = await params;
        router.push(`/survey/${resolvedParams.storeId}`);
      }
    };
    checkSavedData();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');
    localStorage.setItem('surveyData', JSON.stringify({
      ...savedData,
      step3: formData
    }));
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}/step4`);
  };

  const handleBack = async () => {
    const savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');
    const resolvedParams = await params;
    if (savedData.step1?.agreeToMembership) {
      router.push(`/survey/${resolvedParams.storeId}/step2`);
    } else {
      router.push(`/survey/${resolvedParams.storeId}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <>
      <SurveyProgress currentStep={3} totalSteps={5} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Perilaku Pelanggan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Lebih sering membeli makanan di waktu:</Label>
              <div className="grid grid-cols-2 gap-2">
                {timeOptions.map(time => (
                  <label key={time} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="preferredTimeToBuy"
                      value={time}
                      checked={formData.preferredTimeToBuy === time}
                      onChange={handleChange}
                      required
                    />
                    <span>{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lebih sering memesan via:</Label>
              <div className="grid grid-cols-1 gap-2">
                {orderingMethods.map(method => (
                  <label key={method} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="orderingMethod"
                      value={method}
                      checked={formData.orderingMethod === method}
                      onChange={handleChange}
                      required
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteMenu">Menu Favorit (boleh sebutkan merek)</Label>
              <textarea
                id="favoriteMenu"
                name="favoriteMenu"
                value={formData.favoriteMenu}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Ceritakan menu favorit Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyaltyFactors">Faktor loyal terhadap brand (boleh sebutkan merek)</Label>
              <textarea
                id="loyaltyFactors"
                name="loyaltyFactors"
                value={formData.loyaltyFactors}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Apa yang membuat Anda loyal terhadap suatu brand?"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasRecommendedBrand"
                  name="hasRecommendedBrand"
                  checked={formData.hasRecommendedBrand}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="hasRecommendedBrand">
                  Pernah merekomendasikan tempat/resto ke orang lain
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Lanjutkan
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}