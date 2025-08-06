'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, UserPermissions } from '@/lib/types';
import { UserService } from '@/lib/userService';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<(User & { firestoreId: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not super admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load users from Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const firestoreUsers = await UserService.getAllUsers();
        setUsers(firestoreUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'super_admin') {
      loadUsers();
    }
  }, [user]);

  const handleCreateUser = () => {
    router.push('/dashboard/users/new');
  };

  const handleEditUser = (userId: string) => {
    router.push(`/dashboard/users/edit/${userId}`);
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await UserService.toggleUserStatus(userId);
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      );
      setUsers(updatedUsers);
      
      console.log('✅ User status updated');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      alert('Gagal mengubah status user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await UserService.deleteUser(userId);
        
        // Update local state
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        
        console.log('✅ User deleted');
      } catch (error) {
        console.error('❌ Error deleting user:', error);
        alert('Gagal menghapus user');
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionSummary = (permissions?: UserPermissions) => {
    if (!permissions) return 'Tidak ada akses';
    
    const accessList = [];
    if (permissions.subject) accessList.push('Subject');
    if (permissions.survey.results || permissions.survey.analytics) accessList.push('Survey');
    if (permissions.questions.create || permissions.questions.groups || 
        permissions.questions.categories || permissions.questions.collection) {
      accessList.push('Pertanyaan');
    }
    
    return accessList.length > 0 ? accessList.join(', ') : 'Tidak ada akses';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Kelola pengguna dan hak akses mereka</p>
        </div>
        <Button onClick={handleCreateUser} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Buat User Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pengguna</h3>
              <p className="mt-1 text-sm text-gray-500">
                Mulai dengan membuat pengguna baru.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateUser} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat User Baru
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akses Menu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(u.role)}>
                          {getRoleLabel(u.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {u.role === 'super_admin' ? 'Semua akses' : getPermissionSummary(u.permissions)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {u.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(u.firestoreId)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                                                {u.role !== 'super_admin' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(u.firestoreId)}
                            className={u.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(u.firestoreId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}