'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MultipleChoiceData } from '@/lib/multipleChoiceAnalyticsService';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

interface MultipleChoiceChartsProps {
  multipleChoiceData: MultipleChoiceData[];
  selectedQuestion?: string;
  onQuestionSelect: (questionId: string) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export function MultipleChoiceCharts({ multipleChoiceData, selectedQuestion, onQuestionSelect }: MultipleChoiceChartsProps) {

  if (multipleChoiceData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg text-gray-600 mb-2">Belum ada data pilihan ganda</p>
          <p className="text-gray-500">Tidak ada pertanyaan pilihan ganda yang aktif untuk toko ini</p>
        </CardContent>
      </Card>
    );
  }

  const selectedData = selectedQuestion 
    ? multipleChoiceData.find(data => data.questionId === selectedQuestion)
    : multipleChoiceData[0];

  if (!selectedData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = selectedData && selectedData.optionCounts && Object.keys(selectedData.optionCounts).length > 0
    ? Object.entries(selectedData.optionCounts).map(([option, count], index) => ({
        option: option && option.length > 15 ? option.substring(0, 15) + '...' : option || 'Unknown',
        fullOption: option || 'Unknown',
        count: count || 0,
        percentage: selectedData.optionPercentages && selectedData.optionPercentages[option] ? selectedData.optionPercentages[option] : 0,
        color: COLORS[index % COLORS.length]
      }))
    : [];

  const totalResponses = selectedData ? selectedData.totalResponses || 0 : 0;
  
  // Debug logging
  console.log('MultipleChoiceCharts Debug:', {
    selectedData,
    chartData,
    chartDataLength: chartData.length,
    totalResponses
  });
  
  const mostPopularOption = chartData.length > 0 ? chartData.reduce((max, current) => 
    current.count > max.count ? current : max
  ) : { option: 'N/A', fullOption: 'N/A', count: 0, percentage: 0 };
  const leastPopularOption = chartData.length > 0 ? chartData.reduce((min, current) => 
    current.count < min.count ? current : min
  ) : { option: 'N/A', fullOption: 'N/A', count: 0, percentage: 0 };

  return (
    <div className="space-y-6">
      {/* Question Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pilih Pertanyaan Pilihan Ganda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {multipleChoiceData.map((data) => (
              <button
                key={data.questionId}
                onClick={() => onQuestionSelect(data.questionId)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  selectedQuestion === data.questionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">
                  {data.questionText}
                </div>
                <div className="text-sm text-gray-600">
                  {data.totalResponses} jawaban • {Object.keys(data.optionCounts).length} opsi
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jawaban</p>
                <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jumlah Opsi</p>
                <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paling Populer</p>
                <p className="text-lg font-bold text-gray-900">{mostPopularOption.percentage}%</p>
                <p className="text-xs text-gray-500 truncate">{mostPopularOption.fullOption}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kurang Populer</p>
                <p className="text-lg font-bold text-gray-900">{leastPopularOption.percentage}%</p>
                <p className="text-xs text-gray-500 truncate">{leastPopularOption.fullOption}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Jawaban</CardTitle>
          <p className="text-sm text-gray-600">
            {selectedData.questionText}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="option" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string, props: { payload?: { percentage: number } }) => [
                      `${value} (${props.payload?.percentage || 0}%)`,
                      'Jumlah'
                    ]}
                    labelFormatter={(label: string, payload: readonly { payload?: { fullOption?: string } }[]) => 
                      payload && payload[0] ? payload[0].payload?.fullOption || label : label
                    }
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg">Tidak ada data untuk ditampilkan</p>
                  <p className="text-sm">Belum ada jawaban untuk pertanyaan ini</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Hasil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-900">Opsi</th>
                  <th className="text-left py-2 font-medium text-gray-900">Jumlah</th>
                  <th className="text-left py-2 font-medium text-gray-900">Persentase</th>
                  <th className="text-left py-2 font-medium text-gray-900">Visual</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length > 0 ? chartData
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-gray-900">{item.fullOption}</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="font-medium">
                          {item.count}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600">{item.percentage}%</td>
                      <td className="py-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>Tidak ada data untuk ditampilkan</p>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
