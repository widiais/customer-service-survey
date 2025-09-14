'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChecklistData } from '@/lib/checklistAnalyticsService';

interface ChecklistChartsProps {
  checklistData: ChecklistData[];
  selectedQuestion?: string;
  onQuestionSelect?: (questionId: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function ChecklistCharts({ checklistData, selectedQuestion, onQuestionSelect }: ChecklistChartsProps) {
  if (!checklistData || checklistData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg">Belum ada data checklist yang tersedia</p>
          <p className="text-gray-500 text-sm mt-2">Data checklist akan muncul setelah ada jawaban survey</p>
        </CardContent>
      </Card>
    );
  }

  const selectedData = selectedQuestion 
    ? checklistData.find(data => data.questionId === selectedQuestion)
    : checklistData[0];

  if (!selectedData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Data tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = selectedData.options.map(option => ({
    option,
    count: selectedData.optionCounts[option] || 0,
    percentage: selectedData.optionPercentages[option] || 0
  }));

  const totalSelections = Object.values(selectedData.optionCounts).reduce((sum, count) => sum + count, 0);
  const averageSelectionsPerResponse = selectedData.totalResponses > 0 ? 
    totalSelections / selectedData.totalResponses : 0;

  return (
    <div className="space-y-6">
      {/* Question Selector */}
      {checklistData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Pertanyaan Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {checklistData.map((data) => (
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
                      {data.options.length} opsi
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
              {selectedData.totalResponses}
            </div>
            <p className="text-xs text-gray-600">Total Jawaban</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {selectedData.options.length}
            </div>
            <p className="text-xs text-gray-600">Jumlah Opsi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {averageSelectionsPerResponse.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">Rata-rata Pilihan per Jawaban</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {totalSelections}
            </div>
            <p className="text-xs text-gray-600">Total Pilihan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Option Selection Count */}
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Pilihan per Opsi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="option" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} kali dipilih (${chartData.find(d => d.option === name)?.percentage.toFixed(1)}%)`,
                    'Jumlah'
                  ]}
                  labelFormatter={(label) => `Opsi: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Option Selection Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>Persentase Pilihan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ option, percentage }) => `${option} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    `${value} kali dipilih`,
                    'Jumlah'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart - Option Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Opsi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="option" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value} kali dipilih`,
                    'Jumlah'
                  ]}
                  labelFormatter={(label) => `Opsi: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horizontal Bar Chart - Top Options */}
        <Card>
          <CardHeader>
            <CardTitle>Opsi Paling Populer</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData.sort((a, b) => b.count - a.count).slice(0, 10)}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="option" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value} kali dipilih`,
                    'Jumlah'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Option Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pilihan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData
              .sort((a, b) => b.count - a.count)
              .map((option) => (
              <div key={option.option} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {option.option}
                  </div>
                  <div className="text-sm text-gray-500">
                    Dipilih {option.count} kali dari {selectedData.totalResponses} jawaban
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {option.percentage.toFixed(1)}%
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
