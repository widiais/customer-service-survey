'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SurveyProgress } from '@/components/survey/progress';
import { ArrowLeft } from 'lucide-react';

export default function SurveyStep4({ params }: { params: Promise<{ storeId: string }> }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    diningProblems: '',
    orderingDisappointments: '',
    productTrialConcerns: ''
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
      step4: formData
    }));
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}/step5`);
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}/step3`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SurveyProgress currentStep={4} totalSteps={5} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Kendala & Masalah</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="diningProblems">Kendala yang sering dijumpai saat makan di restoran</Label>
              <textarea
                id="diningProblems"
                name="diningProblems"
                value={formData.diningProblems}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Ceritakan kendala yang sering Anda alami..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderingDisappointments">Hal yang membuat kecewa saat order makanan</Label>
              <textarea
                id="orderingDisappointments"
                name="orderingDisappointments"
                value={formData.orderingDisappointments}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Apa yang membuat Anda kecewa saat memesan makanan?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productTrialConcerns">Hal yang membuat ragu mencoba produk baru</Label>
              <textarea
                id="productTrialConcerns"
                name="productTrialConcerns"
                value={formData.productTrialConcerns}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Apa yang membuat Anda ragu untuk mencoba produk baru?"
                required
              />
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