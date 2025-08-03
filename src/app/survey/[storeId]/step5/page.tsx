'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SurveyProgress } from '@/components/survey/progress';
import { ArrowLeft } from 'lucide-react';
import { useQuestionnaires } from '@/hooks/useQuestionnaires';

export default function SurveyStep5({ params }: { params: Promise<{ storeId: string }> }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    expectationsForUs: '',
    expectedPromos: '',
    preferredSocialMediaContent: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { addQuestionnaire } = useQuestionnaires();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');
      const resolvedParams = await params;
      const completeData = {
        storeId: resolvedParams.storeId,
        submittedAt: new Date(),
        customerInfo: savedData.step1,
        membershipDetails: savedData.step2 || null,
        customerBehavior: savedData.step3,
        painPoints: savedData.step4,
        suggestions: formData
      };
      
      await addQuestionnaire(completeData);
      
      // Clear localStorage
      localStorage.removeItem('surveyData');
      
      // Redirect to thank you page
      router.push(`/survey/${resolvedParams.storeId}/thank-you`);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Gagal mengirim survei. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}/step4`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SurveyProgress currentStep={5} totalSteps={5} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Saran & Harapan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expectationsForUs">Harapan terhadap Labbaik Chicken</Label>
              <textarea
                id="expectationsForUs"
                name="expectationsForUs"
                value={formData.expectationsForUs}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Apa harapan Anda terhadap Labbaik Chicken?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedPromos">Promo/program yang diharapkan</Label>
              <textarea
                id="expectedPromos"
                name="expectedPromos"
                value={formData.expectedPromos}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Promo atau program seperti apa yang Anda harapkan?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredSocialMediaContent">Konten media sosial yang disukai</Label>
              <textarea
                id="preferredSocialMediaContent"
                name="preferredSocialMediaContent"
                value={formData.preferredSocialMediaContent}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Konten seperti apa yang ingin Anda lihat di media sosial kami?"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Survei'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}