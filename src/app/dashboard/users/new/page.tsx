'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPermissions } from '@/lib/types';
import { UserService } from '@/lib/userService';
import { ArrowLeft, Save, UserX } from 'lucide-react';

export default function NewUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'staff' as 'admin' | 'staff'
  });
  const [permissions, setPermissions] = useState<UserPermissions>({
    subject: false,
    survey: {
      results: false,
      analytics: false,
      grafik: false
    },
    questions: {
      create: false,
      groups: false,
      categories: false,
      collection: false
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not super admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (section: string, permission: string, checked: boolean) => {
    setPermissions(prev => {
      if (section === 'root') {
        return { ...prev, [permission]: checked };
      } else {
        const sectionKey = section as keyof UserPermissions;
        const currentSection = prev[sectionKey];
        if (typeof currentSection === 'object' && currentSection !== null) {
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [permission]: checked
            }
          };
        }
        return prev;
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await UserService.createUser({
        username: formData.username,
        name: formData.name,
        role: formData.role,
        password: formData.password,
        permissions
      });

      console.log('✅ User created successfully in Firestore');
      router.push('/dashboard/users');
    } catch (error: unknown) {
      console.error('❌ Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage === 'Username sudah digunakan') {
        setErrors({ username: errorMessage });
      } else {
        setErrors({ general: 'Terjadi kesalahan saat membuat user' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/users');
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserX className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Akses Ditolak</h2>
          <p className="mt-1 text-sm text-gray-500">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat User Baru</h1>
          <p className="text-gray-600">Tambah pengguna baru dan atur hak aksesnya</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Masukkan username"
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Konfirmasi password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Hak Akses Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="subject"
                    checked={permissions.subject}
                    onChange={(e) => handlePermissionChange('root', 'subject', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <Label htmlFor="subject" className="font-medium">Subject</Label>
                </div>
              </div>

              {/* Survey */}
              <div className="space-y-2">
                <Label className="font-medium">Survey</Label>
                <div className="ml-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="survey-results"
                      checked={permissions.survey.results}
                      onChange={(e) => handlePermissionChange('survey', 'results', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="survey-results">Hasil Survey</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="survey-analytics"
                      checked={permissions.survey.analytics}
                      onChange={(e) => handlePermissionChange('survey', 'analytics', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="survey-analytics">Analytics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="survey-grafik"
                      checked={permissions.survey.grafik}
                      onChange={(e) => handlePermissionChange('survey', 'grafik', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="survey-grafik">Grafik</Label>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <Label className="font-medium">Pertanyaan</Label>
                <div className="ml-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="questions-create"
                      checked={permissions.questions.create}
                      onChange={(e) => handlePermissionChange('questions', 'create', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="questions-create">Buat Pertanyaan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="questions-groups"
                      checked={permissions.questions.groups}
                      onChange={(e) => handlePermissionChange('questions', 'groups', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="questions-groups">Grup Pertanyaan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="questions-categories"
                      checked={permissions.questions.categories}
                      onChange={(e) => handlePermissionChange('questions', 'categories', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="questions-categories">Kategori</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="questions-collection"
                      checked={permissions.questions.collection}
                      onChange={(e) => handlePermissionChange('questions', 'collection', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="questions-collection">Koleksi</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Batal
          </Button>
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}