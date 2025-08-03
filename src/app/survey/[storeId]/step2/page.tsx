'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SurveyProgress } from '@/components/survey/progress';
import { ArrowLeft } from 'lucide-react';

const ageRanges = ['18-25', '26-35', '36-45', '46-55', '55+'];
const incomeRanges = ['< 3 juta', '3-5 juta', '5-10 juta', '10-15 juta', '> 15 juta'];
const socialMediaOptions = ['Instagram', 'TikTok', 'Facebook', 'Twitter', 'YouTube', 'WhatsApp'];

export default function SurveyStep2({ params }: { params: Promise<{ storeId: string }> }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    profession: '',
    incomeRange: '',
    dailyActivities: '',
    hobbies: '',
    preferredSocialMedia: ''
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
      step2: formData
    }));
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}/step3`);
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/survey/${resolvedParams.storeId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SurveyProgress currentStep={2} totalSteps={5} />
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Detail Keanggotaan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Usia</Label>
              <select
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Rentang Usia</option>
                {ageRanges.map(range => (
                  <option key={range} value={range}>{range} tahun</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession">Profesi</Label>
              <Input
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="Contoh: Karyawan, Mahasiswa, Wiraswasta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeRange">Perkiraan Penghasilan (per bulan)</Label>
              <select
                id="incomeRange"
                name="incomeRange"
                value={formData.incomeRange}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Rentang Penghasilan</option>
                {incomeRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyActivities">Kegiatan Sehari-hari</Label>
              <textarea
                id="dailyActivities"
                name="dailyActivities"
                value={formData.dailyActivities}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Ceritakan aktivitas harian Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobi</Label>
              <Input
                id="hobbies"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleChange}
                placeholder="Contoh: Olahraga, Membaca, Traveling"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredSocialMedia">Media Sosial yang Paling Sering Digunakan</Label>
              <select
                id="preferredSocialMedia"
                name="preferredSocialMedia"
                value={formData.preferredSocialMedia}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih Media Sosial</option>
                {socialMediaOptions.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
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