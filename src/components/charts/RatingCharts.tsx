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

interface RatingData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  ratings: number[];
  averageRating: number;
  totalResponses: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

interface RatingChartsProps {
  ratingData: RatingData[];
  selectedQuestion?: string;
  onQuestionSelect?: (questionId: string) => void;
}


export function RatingCharts({ ratingData, selectedQuestion, onQuestionSelect }: RatingChartsProps) {
  if (!ratingData || ratingData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg">Belum ada data rating yang tersedia</p>
          <p className="text-gray-500 text-sm mt-2">Data rating akan muncul setelah ada jawaban survey</p>
        </CardContent>
      </Card>
    );
  }

  const selectedData = selectedQuestion 
    ? ratingData.find(data => data.questionId === selectedQuestion)
    : ratingData[0];

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
      {/* Question Selector */}
      {ratingData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Pertanyaan Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {ratingData.map((data) => (
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
                      Rata-rata: {data.averageRating.toFixed(1)}/5
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {selectedData.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">Rata-rata Rating</p>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(selectedData.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
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
            <div className="text-2xl font-bold text-yellow-600">
              {selectedData.distribution.find(d => d.rating === 5)?.count || 0}
            </div>
            <p className="text-xs text-gray-600">Rating 5 Bintang</p>
            <p className="text-xs text-gray-500">
              {((selectedData.distribution.find(d => d.rating === 5)?.percentage || 0)).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {selectedData.distribution.find(d => d.rating === 1)?.count || 0}
            </div>
            <p className="text-xs text-gray-600">Rating 1 Bintang</p>
            <p className="text-xs text-gray-500">
              {((selectedData.distribution.find(d => d.rating === 1)?.percentage || 0)).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedData.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="rating" 
                  tickFormatter={(value) => `${value} ⭐`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} jawaban (${selectedData.distribution.find(d => d.rating === Number(name))?.percentage.toFixed(1)}%)`,
                    'Jumlah'
                  ]}
                  labelFormatter={(label) => `Rating ${label} bintang`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Rating Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedData.distribution.map((dist) => (
              <div key={dist.rating} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= dist.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {dist.rating} bintang
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {dist.count} ({dist.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
