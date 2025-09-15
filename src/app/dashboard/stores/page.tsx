'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, QrCode, FileText } from 'lucide-react';
import Link from 'next/link';
import { useStores } from '@/hooks/useStores';
import { useQuestionGroups } from '@/hooks/useQuestionGroups';
import { StoreAccessService } from '@/lib/storeAccessService';
import { useAuth } from '@/contexts/AuthContext';
import { generateStoreQRUrl } from '@/lib/utils';
import { QRPopup } from '@/components/ui/qr-popup';

export default function StoresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // QR Popup state
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string; url: string } | null>(null);
  
  const { stores, loading, error, deleteStore } = useStores();
  const { questionGroups } = useQuestionGroups();

  // Filter stores based on access control
  const accessibleStores = StoreAccessService.filterAccessibleStores(user, stores);
  
  const filteredStores = accessibleStores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Subject Form ini?')) {
      try {
        await deleteStore(id);
      } catch {
        alert('Gagal menghapus Subject Form');
      }
    }
  };

  const handleShowQR = (storeId: string, storeName: string) => {
    const qrUrl = generateStoreQRUrl(storeId);
    setSelectedStore({ id: storeId, name: storeName, url: qrUrl });
    setShowQRPopup(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Subject Form</h1>
          <p className="text-gray-600">Kelola data Subject Form dan grup pertanyaan</p>
        </div>
        <div className="flex space-x-2">
          {StoreAccessService.canCreateStore(user) && (
            <Link href="/dashboard/stores/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Subject Form
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Subject Form atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStores.map((store) => {
              const assignedGroups = questionGroups.filter(group => 
                store.questionGroupIds?.includes(group.id)
              );
              
              return (
                <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                    <p className="text-sm text-gray-500">{store.phone} • {store.email}</p>
                    {assignedGroups.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-blue-600">
                          Grup: {assignedGroups.map(g => g.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/dashboard/stores/${store.id}/assign-groups`)}
                      title="Pilih Grup Pertanyaan"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShowQR(store.id!, store.name)}
                      title="Tampilkan QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/stores/${store.id}/edit`}>
                      <Button variant="outline" size="sm" title="Edit Subject Form">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(store.id!)}
                      title="Hapus Subject Form"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Popup */}
      {selectedStore && (
        <QRPopup
          isOpen={showQRPopup}
          onClose={() => {
            setShowQRPopup(false);
            setSelectedStore(null);
          }}
          qrUrl={selectedStore.url}
          storeName={selectedStore.name}
        />
      )}
    </div>
  );
}