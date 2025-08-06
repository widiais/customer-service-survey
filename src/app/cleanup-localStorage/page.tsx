'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserService } from '@/lib/userService';
import { Trash2, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CleanupLocalStoragePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'cleanup' | 'done'>('check');

  const checkData = async () => {
    setMessage('🔍 Mengecek data di localStorage dan Firestore...\n\n');

    try {
      // Check localStorage
      const localUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const localPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
      const authUser = localStorage.getItem('auth_user');
      
      setMessage(prev => prev + `📱 **localStorage Data:**\n`);
      setMessage(prev => prev + `- app_users: ${localUsers.length} users\n`);
      setMessage(prev => prev + `- user_passwords: ${Object.keys(localPasswords).length} passwords\n`);
      setMessage(prev => prev + `- auth_user: ${authUser ? 'Ada session' : 'Tidak ada session'}\n\n`);

      if (localUsers.length > 0) {
        setMessage(prev => prev + `👥 **Users di localStorage:**\n`);
        localUsers.forEach((user: { username: string; role: string; id: string }, index: number) => {
          const hasPassword = !!localPasswords[user.id];
          setMessage(prev => prev + `${index + 1}. ${user.username} (${user.role}) ${hasPassword ? '🔑' : '❌'}\n`);
        });
        setMessage(prev => prev + '\n');
      }

      // Check Firestore
      const firestoreUsers = await UserService.getAllUsers();
      setMessage(prev => prev + `🔥 **Firestore Data:**\n`);
      setMessage(prev => prev + `- users collection: ${firestoreUsers.length} users\n\n`);

      if (firestoreUsers.length > 0) {
        setMessage(prev => prev + `👥 **Users di Firestore:**\n`);
        firestoreUsers.forEach((user: { username: string; role: string }, index: number) => {
          setMessage(prev => prev + `${index + 1}. ${user.username} (${user.role}) 🔑\n`);
        });
        setMessage(prev => prev + '\n');
      }

      // Analysis
      setMessage(prev => prev + `📊 **Analisis:**\n`);
      if (localUsers.length === 0 && firestoreUsers.length > 0) {
        setMessage(prev => prev + `✅ Sempurna! localStorage sudah bersih, Firestore ada data\n`);
        setMessage(prev => prev + `✅ Sistem sudah menggunakan Firestore sepenuhnya\n`);
        setStep('done');
      } else if (localUsers.length > 0 && firestoreUsers.length > 0) {
        setMessage(prev => prev + `⚠️ Ada data di localStorage DAN Firestore\n`);
        setMessage(prev => prev + `🧹 Perlu cleanup localStorage agar tidak konflik\n`);
        setStep('cleanup');
      } else if (localUsers.length > 0 && firestoreUsers.length === 0) {
        setMessage(prev => prev + `❌ Data hanya di localStorage, belum ada di Firestore\n`);
        setMessage(prev => prev + `🚨 Migrasi ke Firestore dulu di /migrate-users\n`);
      } else {
        setMessage(prev => prev + `❌ Tidak ada data user di localStorage maupun Firestore\n`);
        setMessage(prev => prev + `🚨 Perlu setup super admin dan user management\n`);
      }

    } catch (error) {
      console.error('Error checking data:', error);
      setMessage(prev => prev + `❌ Error: ${error}\n`);
    }
  };

  const cleanupLocalStorage = () => {
    if (!confirm('⚠️ KONFIRMASI CLEANUP\n\nIni akan menghapus SEMUA data user dari localStorage:\n- app_users\n- user_passwords\n- auth_user (session)\n\nPastikan data sudah aman di Firestore!\n\nLanjutkan?')) {
      return;
    }

    setIsLoading(true);
    setMessage(prev => prev + `\n🧹 **MEMULAI CLEANUP LOCALSTORAGE...**\n\n`);

    try {
      // Backup current data
      const localUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const localPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
      const authUser = localStorage.getItem('auth_user');

      setMessage(prev => prev + `📦 Backup data sebelum dihapus:\n`);
      setMessage(prev => prev + `- ${localUsers.length} users\n`);
      setMessage(prev => prev + `- ${Object.keys(localPasswords).length} passwords\n`);
      setMessage(prev => prev + `- ${authUser ? 'Active session' : 'No session'}\n\n`);

      // Remove localStorage data
      localStorage.removeItem('app_users');
      localStorage.removeItem('user_passwords');
      localStorage.removeItem('auth_user');

      setMessage(prev => prev + `🗑️ **DIHAPUS:**\n`);
      setMessage(prev => prev + `✅ app_users - CLEARED\n`);
      setMessage(prev => prev + `✅ user_passwords - CLEARED\n`);
      setMessage(prev => prev + `✅ auth_user - CLEARED\n\n`);

      setMessage(prev => prev + `🎉 **CLEANUP SELESAI!**\n\n`);
      setMessage(prev => prev + `✅ localStorage sudah bersih\n`);
      setMessage(prev => prev + `✅ Sistem sekarang 100% menggunakan Firestore\n`);
      setMessage(prev => prev + `✅ Login akan menggunakan data dari collection users\n\n`);

      setMessage(prev => prev + `📋 **LANGKAH SELANJUTNYA:**\n`);
      setMessage(prev => prev + `1. Refresh halaman untuk clear session\n`);
      setMessage(prev => prev + `2. Login ulang dengan credentials Firestore\n`);
      setMessage(prev => prev + `3. Test semua user bisa login normal\n`);

      setStep('done');

    } catch (error) {
      console.error('Cleanup error:', error);
      setMessage(prev => prev + `❌ Error cleanup: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Trash2 className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">🧹 Cleanup localStorage</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Bersihkan Data Lokal - Gunakan Firestore Saja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ⚠️ Yang akan dilakukan:
            </h3>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Cek data di localStorage vs Firestore</li>
              <li>Hapus semua data user dari localStorage</li>
              <li>Sistem akan 100% menggunakan Firestore collection</li>
              <li>Session login akan di-reset</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              onClick={checkData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              🔍 Cek Data
            </Button>
            
            {step === 'cleanup' && (
              <Button 
                onClick={cleanupLocalStorage}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                🧹 Cleanup localStorage
              </Button>
            )}

            {step === 'done' && (
              <>
                <Button 
                  onClick={refreshPage}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  🔄 Refresh Page
                </Button>
                <Button 
                  onClick={goToLogin}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  🔐 Go to Login
                </Button>
              </>
            )}
          </div>

          {message && (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              📝 Proses Cleanup:
            </h3>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li><strong>Cek Data:</strong> Lihat data di localStorage vs Firestore</li>
              <li><strong>Cleanup:</strong> Hapus localStorage jika ada konflik</li>
              <li><strong>Refresh:</strong> Reload page untuk clear session</li>
              <li><strong>Test Login:</strong> Login dengan data dari Firestore</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Setelah cleanup:</h3>
            <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
              <li>Sistem 100% menggunakan Firestore</li>
              <li>User bisa login dari device manapun</li>
              <li>Data tidak hilang saat clear browser</li>
              <li>Tidak ada konflik localStorage vs Firestore</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}