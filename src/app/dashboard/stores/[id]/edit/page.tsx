'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useStores } from '@/hooks/useStores';
import { Store } from '@/lib/types';
import { StoreAccessService } from '@/lib/storeAccessService';
import { useAuth } from '@/contexts/AuthContext';
import { ManagerSelector } from '@/components/store/ManagerSelector';

const defaultRegions = ['Regional 1', 'Regional 2', 'Regional 3'];
const defaultCities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang'];

interface TagInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}

function TagInput({ label, value, onChange, suggestions, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filteredSuggestions = suggestions.filter(item => 
    item.toLowerCase().includes(inputValue.toLowerCase()) && item !== value
  );

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setInputValue('');
    setShowSuggestions(false);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
      setIsAddingNew(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddNew();
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsAddingNew(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {value ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {value}
              <button
                type="button"
                onClick={handleRemove}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Ubah
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowSuggestions(true);
              setIsAddingNew(true);
            }}
            className="w-full justify-start text-gray-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
        )}

        {(showSuggestions || isAddingNew) && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ketik ${label.toLowerCase()} baru atau pilih dari daftar`}
                className="mb-2"
                autoFocus
              />
              {inputValue.trim() && (
                <Button
                  type="button"
                  onClick={handleAddNew}
                  size="sm"
                  className="w-full mb-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah &quot;{inputValue.trim()}&quot;
                </Button>
              )}
            </div>
            
            {filteredSuggestions.length > 0 && (
              <div className="border-t border-gray-100">
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-2">Pilih dari daftar:</p>
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-100 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSuggestions(false);
                  setIsAddingNew(false);
                  setInputValue('');
                }}
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const storeId = params.id as string;
  const { stores, updateStore, loading } = useStores();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    area: '',
    phone: '',
    email: '',
    manager: ''
  });
  const [storeFound, setStoreFound] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  // Load store data when component mounts
  useEffect(() => {
    if (!loading && stores.length > 0) {
      const store = stores.find(s => s.id === storeId);
      if (store) {
        // Ensure managers field exists with default values
        const storeWithManagers = {
          ...store,
          managers: store.managers || [store.createdBy || ''].filter(Boolean),
          createdBy: store.createdBy || ''
        };
        setCurrentStore(storeWithManagers);
        setFormData({
          name: store.name || '',
          address: store.address || '',
          city: store.city || '',
          region: store.region || '',
          area: store.area || '',
          phone: store.phone || '',
          email: store.email || '',
          manager: store.manager || ''
        });
        setStoreFound(true);
      } else {
        setStoreFound(false);
      }
    }
  }, [stores, loading, storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateStore(storeId, {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        area: formData.area,
        phone: formData.phone,
        email: formData.email,
        manager: formData.manager
      });
      router.push('/dashboard/stores');
    } catch {
      alert('Gagal memperbarui Form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTagChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateManagers = async (managers: string[]) => {
    if (!currentStore) return;
    
    try {
      // Ensure creator is always in managers list
      const updatedManagers = managers.includes(currentStore.createdBy) 
        ? managers 
        : [...managers, currentStore.createdBy].filter(Boolean);
        
      await updateStore(storeId, {
        ...currentStore,
        managers: updatedManagers
      });
      
      // Update current store state
      setCurrentStore(prev => prev ? { ...prev, managers: updatedManagers } : null);
    } catch {
      alert('Gagal memperbarui manager list');
    }
  };

  // Check if user can access this store
  const canAccess = currentStore ? StoreAccessService.canAccessStore(user, currentStore) : false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data Subject Form...</p>
        </div>
      </div>
    );
  }

  if (!storeFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/stores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subject Form Tidak Ditemukan</h1>
            <p className="text-gray-600">Subject Form dengan ID tersebut tidak ditemukan</p>
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 mb-4">Subject Form yang Anda cari tidak ditemukan.</p>
            <div className="text-center">
              <Link href="/dashboard/stores">
                <Button>Kembali ke Daftar Subject Form</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/stores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-red-600">Akses Ditolak</h1>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses Subject Form ini</p>
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 mb-4">Anda hanya dapat mengakses Subject Form yang Anda buat atau manage.</p>
            <div className="text-center">
              <Link href="/dashboard/stores">
                <Button>Kembali ke Daftar Subject Form</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/stores">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Subject Form</h1>
          <p className="text-gray-600">Perbarui informasi Subject Form</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Subject Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Subject Form</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Labbaik Kemang"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat lengkap Subject Form"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TagInput
                label="Kota"
                value={formData.city}
                onChange={(value) => handleTagChange('city', value)}
                suggestions={defaultCities}
                placeholder="Pilih atau tambah kota"
              />

              <TagInput
                label="Regional"
                value={formData.region}
                onChange={(value) => handleTagChange('region', value)}
                suggestions={defaultRegions}
                placeholder="Pilih atau tambah regional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Contoh: Kemang, Senayan"
                required
              />
            </div>
            
            {/* Manager Selector */}
            {currentStore && (
              <div className="pt-6 border-t">
                <ManagerSelector 
                  store={currentStore} 
                  onUpdateManagers={handleUpdateManagers}
                />
              </div>
            )}
            
            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.city || !formData.region}
              >
                {isSubmitting ? 'Memperbarui...' : 'Perbarui Subject Form'}
              </Button>
              <Link href="/dashboard/stores">
                <Button variant="outline">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}