'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Store } from '@/lib/types';
import { UserService } from '@/lib/userService';
import { StoreAccessService } from '@/lib/storeAccessService';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Users, Shield } from 'lucide-react';

interface ManagerSelectorProps {
  store: Store;
  onUpdateManagers: (managers: string[]) => void;
}

export function ManagerSelector({ store, onUpdateManagers }: ManagerSelectorProps) {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<(User & { firestoreId: string })[]>([]);
  const [managerUsers, setManagerUsers] = useState<(User & { firestoreId: string })[]>([]);
  const [availableUsers, setAvailableUsers] = useState<(User & { firestoreId: string })[]>([]);
  const [creatorUser, setCreatorUser] = useState<(User & { firestoreId: string }) | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  // Check if current user can manage managers
  const canManageManagers = StoreAccessService.canManageManagers(currentUser, store);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (allUsers.length > 0) {
      // Find creator
      const creator = allUsers.find(u => u.id === store.createdBy);
      setCreatorUser(creator || null);

      // Find current managers (safe check for undefined managers array)
      const storeManagers = store.managers || [];
      const managers = allUsers.filter(u => storeManagers.includes(u.id));
      setManagerUsers(managers);

      // Find available users (not managers, exclude super_admin)
      const available = allUsers.filter(u => 
        !storeManagers.includes(u.id) && 
        u.role !== 'super_admin' &&
        u.isActive
      );
      setAvailableUsers(available);
    }
  }, [allUsers, store.managers, store.createdBy]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const users = await UserService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManager = (userId: string) => {
    const storeManagers = store.managers || [];
    if (!storeManagers.includes(userId)) {
      const newManagers = [...storeManagers, userId];
      onUpdateManagers(newManagers);
    }
  };

  const handleRemoveManager = (userId: string) => {
    // Cannot remove creator
    if (userId === store.createdBy) {
      alert('Creator tidak dapat dihapus dari manager list');
      return;
    }

    const storeManagers = store.managers || [];
    const newManagers = storeManagers.filter(id => id !== userId);
    onUpdateManagers(newManagers);
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManageManagers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manager Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {creatorUser && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  <Shield className="h-3 w-3 mr-1" />
                  Creator: {creatorUser.name} (@{creatorUser.username})
                </Badge>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {managerUsers.map(manager => (
                <Badge key={manager.id} variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {manager.name} (@{manager.username})
                </Badge>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Anda tidak memiliki izin untuk mengelola manager
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kelola Manager Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Creator Info */}
        {creatorUser && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <Label className="text-sm font-medium text-blue-800">Creator (Permanent)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-blue-100">
                <Shield className="h-3 w-3 mr-1" />
                {creatorUser.name} (@{creatorUser.username})
              </Badge>
            </div>
          </div>
        )}

        {/* Current Managers */}
        <div>
          <Label className="text-sm font-medium">Current Managers ({managerUsers.length})</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {managerUsers.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada manager yang ditambahkan</p>
            ) : (
              managerUsers.map(manager => (
                <Badge key={manager.id} variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {manager.name} (@{manager.username})
                  {manager.id !== store.createdBy && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                      onClick={() => handleRemoveManager(manager.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Add New Manager */}
        <div>
          <Label className="text-sm font-medium">Tambah Manager Baru</Label>
          <div className="space-y-2 mt-2">
            <Input
              placeholder="Cari user berdasarkan username atau nama..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!showUserList) setShowUserList(true);
              }}
              onFocus={() => setShowUserList(true)}
              onBlur={() => {
                // Delay hiding to allow clicking on user items
                setTimeout(() => setShowUserList(false), 150);
              }}
            />
            
            {showUserList && (
              <div className="max-h-40 overflow-y-auto border rounded p-2 mt-1">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading users...</p>
                ) : !searchTerm ? (
                  <p className="text-sm text-gray-500">
                    Mulai mengetik untuk mencari user...
                  </p>
                ) : filteredAvailableUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Tidak ada user yang cocok dengan &quot;{searchTerm}&quot;
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredAvailableUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onMouseDown={(e) => {
                          // Prevent onBlur from hiding the list before click
                          e.preventDefault();
                          handleAddManager(user.id);
                          setShowUserList(false);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <span className="text-sm">{user.name} (@{user.username})</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="pointer-events-none"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800">
            <strong>Info:</strong> Manager dapat melihat dan mengelola store ini, 
            hasil survey, dan analytics. Creator tidak dapat dihapus dari manager list.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}