import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, FileText, Users, TrendingUp } from 'lucide-react';

const stats = [
  { title: 'Total Toko', value: '12', icon: Store, color: 'text-blue-600' },
  { title: 'Survei Bulan Ini', value: '156', icon: FileText, color: 'text-green-600' },
  { title: 'Responden Aktif', value: '89', icon: Users, color: 'text-purple-600' },
  { title: 'Tingkat Kepuasan', value: '4.2/5', icon: TrendingUp, color: 'text-orange-600' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen pelanggan Labbaik Chicken</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Survei Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Toko Kemang</p>
                  <p className="text-sm text-gray-500">2 jam yang lalu</p>
                </div>
                <span className="text-green-600 text-sm">Selesai</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Toko Senayan</p>
                  <p className="text-sm text-gray-500">5 jam yang lalu</p>
                </div>
                <span className="text-green-600 text-sm">Selesai</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performa Regional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Regional 1</span>
                <span className="font-medium">4.5/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Regional 2</span>
                <span className="font-medium">4.2/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Regional 3</span>
                <span className="font-medium">4.0/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}