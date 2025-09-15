'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/contexts/AuthContext';

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

export default function NewStorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addStore } = useStores();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    area: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addStore({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        area: formData.area,
        phone: '',
        email: '',
        manager: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '', // Set creator
        managers: [user?.id || ''], // Creator is first manager
      });
      router.push('/dashboard/stores');
    } catch {
      alert('Gagal menyimpan toko');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/stores">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Subject Form Baru</h1>
          <p className="text-gray-600">Masukkan informasi Subject Form baru</p>
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

            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.city || !formData.region}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Subject Form'}
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