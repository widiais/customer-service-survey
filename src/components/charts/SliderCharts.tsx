'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface SliderData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  values: number[];
  average: number;
  totalResponses: number;
  distribution: { value: number; count: number; percentage: number }[];
}

interface SliderChartsProps {
  sliderData: SliderData[];
  selectedQuestion?: string;
  onQuestionSelect?: (questionId: string) => void;
}

export function SliderCharts({ sliderData, selectedQuestion, onQuestionSelect }: SliderChartsProps) {
  if (!sliderData || sliderData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg">Belum ada data slider yang tersedia</p>
          <p className="text-gray-500 text-sm mt-2">Data slider akan muncul setelah ada jawaban survey</p>
        </CardContent>
      </Card>
    );
  }

  const selectedData = selectedQuestion 
    ? sliderData.find(data => data.questionId === selectedQuestion)
    : sliderData[0];

  if (!selectedData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Data tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sliderData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Pertanyaan Slider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {sliderData.map((data) => (
                <button
                  key={data.questionId}
                  onClick={() => onQuestionSelect?.(data.questionId)}
                  className={`p-6 text-left border rounded-lg transition-colors w-full ${
                    selectedQuestion === data.questionId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-base text-gray-900 mb-2">
                    {data.questionText}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {data.sectionName} • {data.totalResponses} jawaban
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Rata-rata: {data.average.toFixed(1)}/10
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {selectedData.average.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">Rata-rata Slider (1-10)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {selectedData.totalResponses}
            </div>
            <p className="text-xs text-gray-600">Total Jawaban</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600">Skala: 1 (rendah) → 10 (tinggi)</div>
            <div className="h-2 w-full rounded mt-2" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #22c55e 100%)' }}></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribusi Nilai Slider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedData.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} jawaban`, 'Jumlah']}
                  labelFormatter={(label) => `Nilai ${label}`}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


