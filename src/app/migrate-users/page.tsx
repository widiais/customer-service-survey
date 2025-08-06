'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserService } from '@/lib/userService';

export default function MigrateUsersPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const migrateFromLocalStorage = async () => {
    setIsLoading(true);
    setMessage('🔄 Memulai migrasi users dari localStorage ke Firestore...\n');

    try {
      // Get data from localStorage
      const localUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const localPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');

      if (localUsers.length === 0) {
        setMessage(prev => prev + '❌ Tidak ada user di localStorage untuk dimigrasi.\n');
        setIsLoading(false);
        return;
      }

      setMessage(prev => prev + `📊 Ditemukan ${localUsers.length} users di localStorage\n\n`);

      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const localUser of localUsers) {
        try {
          const password = localPasswords[localUser.id];
          
          if (!password) {
            setMessage(prev => prev + `⚠️ Skip ${localUser.username}: Password tidak ditemukan\n`);
            skippedCount++;
            continue;
          }

          // Try to create user in Firestore
          await UserService.createUser({
            username: localUser.username,
            name: localUser.name,
            role: localUser.role,
            password: password,
            permissions: localUser.permissions
          });

          setMessage(prev => prev + `✅ Migrasi berhasil: ${localUser.username}\n`);
          migratedCount++;

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage === 'Username sudah digunakan') {
            setMessage(prev => prev + `⏭️ Skip ${localUser.username}: Sudah ada di Firestore\n`);
            skippedCount++;
          } else {
            setMessage(prev => prev + `❌ Error ${localUser.username}: ${errorMessage}\n`);
            errorCount++;
          }
        }
      }

      setMessage(prev => prev + `\n🎉 Migrasi selesai!\n`);
      setMessage(prev => prev + `✅ Berhasil: ${migratedCount} users\n`);
      setMessage(prev => prev + `⏭️ Dilewati: ${skippedCount} users\n`);
      setMessage(prev => prev + `❌ Error: ${errorCount} users\n`);

      if (migratedCount > 0) {
        setMessage(prev => prev + `\n📝 Sekarang Anda bisa:\n`);
        setMessage(prev => prev + `1. Test login dengan user yang sudah dimigrasi\n`);
        setMessage(prev => prev + `2. Hapus data localStorage jika semua sudah aman\n`);
      }

    } catch (error) {
      console.error('Migration error:', error);
      setMessage(prev => prev + `❌ Error migrasi: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('⚠️ Apakah Anda yakin ingin menghapus semua data user dari localStorage?\n\nPastikan migrasi ke Firestore sudah berhasil!')) {
      localStorage.removeItem('app_users');
      localStorage.removeItem('user_passwords');
      setMessage(prev => prev + '\n🗑️ Data localStorage berhasil dihapus!\n');
    }
  };

  const checkBothSources = async () => {
    setMessage('🔍 Mengecek data di localStorage dan Firestore...\n\n');

    try {
      // Check localStorage
      const localUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const localPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
      
      setMessage(prev => prev + `📱 localStorage: ${localUsers.length} users\n`);
      localUsers.forEach((user: { username: string; role: string; id: string }) => {
        const hasPassword = !!localPasswords[user.id];
        setMessage(prev => prev + `  - ${user.username} (${user.role}) ${hasPassword ? '🔑' : '❌'}\n`);
      });

      // Check Firestore
      const firestoreUsers = await UserService.getAllUsers();
      setMessage(prev => prev + `\n🔥 Firestore: ${firestoreUsers.length} users\n`);
      firestoreUsers.forEach((user: { username: string; role: string }) => {
        setMessage(prev => prev + `  - ${user.username} (${user.role}) 🔑\n`);
      });

      setMessage(prev => prev + `\n📊 Perbandingan:\n`);
      setMessage(prev => prev + `- localStorage: ${localUsers.length} users\n`);
      setMessage(prev => prev + `- Firestore: ${firestoreUsers.length} users\n`);

    } catch (error) {
      setMessage(prev => prev + `❌ Error checking data: ${error}\n`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🚀 Migrasi Users ke Firestore</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Migrasi User Management ke Global Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Yang akan dilakukan:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Memindahkan semua user dari localStorage ke Firestore</li>
              <li>Password akan di-hash untuk keamanan</li>
              <li>User bisa login dari browser/device manapun</li>
              <li>Data tersimpan secara global dan aman</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              onClick={checkBothSources}
              disabled={isLoading}
              variant="outline"
            >
              🔍 Cek Data
            </Button>
            
            <Button 
              onClick={migrateFromLocalStorage}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              🚀 Mulai Migrasi
            </Button>
            
            <Button 
              onClick={clearLocalStorage}
              disabled={isLoading}
              variant="destructive"
            >
              🗑️ Hapus localStorage
            </Button>
          </div>

          {message && (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">📝 Langkah-langkah:</h3>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li><strong>Cek Data:</strong> Lihat user yang ada di localStorage vs Firestore</li>
              <li><strong>Mulai Migrasi:</strong> Pindahkan semua user ke Firestore</li>
              <li><strong>Test Login:</strong> Pastikan semua user bisa login</li>
              <li><strong>Hapus localStorage:</strong> Bersihkan data lokal (opsional)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}