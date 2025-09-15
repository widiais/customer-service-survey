'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/lib/types';

const colorOptions = [
  { value: 'blue', label: 'Biru', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Hijau', class: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: 'Kuning', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'red', label: 'Merah', class: 'bg-red-100 text-red-800' },
  { value: 'purple', label: 'Ungu', class: 'bg-purple-100 text-purple-800' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-800' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true
  });
  
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory({
        ...newCategory,
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewCategory({ name: '', description: '', color: 'blue', isActive: true });
    } catch {
      alert('Gagal menambah kategori');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
        color: editingCategory.color,
        isActive: editingCategory.isActive
      });
      setEditingCategory(null);
    } catch {
      alert('Gagal mengupdate kategori');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await deleteCategory(id);
      } catch {
        alert('Gagal menghapus kategori');
      }
    }
  };

  const getColorClass = (color: string) => {
    return colorOptions.find(opt => opt.value === color)?.class || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Pertanyaan</h1>
          <p className="text-gray-600">Kelola kategori untuk mengelompokkan pertanyaan</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kategori Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nama Kategori</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Produk, Pelayanan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color">Warna</Label>
                  <select
                    id="category-color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Deskripsi (Opsional)</Label>
                <Input
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi kategori..."
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">Simpan Kategori</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name">Nama Kategori</Label>
                  <Input
                    id="edit-category-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory((prev: Category | null) => prev ? ({ ...prev, name: e.target.value }) : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-color">Warna</Label>
                  <select
                    id="edit-category-color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory((prev: Category | null) => prev ? ({ ...prev, color: e.target.value }) : null)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category-description">Deskripsi</Label>
                <Input
                  id="edit-category-description"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory((prev: Category | null) => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">Update Kategori</Button>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getColorClass(category.color || 'blue')
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  <span>{new Date(category.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}