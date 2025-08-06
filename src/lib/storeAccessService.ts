import { User, Store } from './types';

export class StoreAccessService {
  /**
   * Check if user can access a specific store
   */
  static canAccessStore(user: User | null, store: Store): boolean {
    if (!user) return false;
    
    // Super admin can access everything
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Store creator can access
    if (store.createdBy === user.id) {
      return true;
    }
    
    // Managers can access
    if (store.managers && store.managers.includes(user.id)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Filter stores based on user access
   */
  static filterAccessibleStores(user: User | null, stores: Store[]): Store[] {
    if (!user) return [];
    
    // Super admin can see all stores
    if (user.role === 'super_admin') {
      return stores;
    }
    
    // Filter stores based on access
    return stores.filter(store => this.canAccessStore(user, store));
  }
  
  /**
   * Check if user can edit/manage a store
   */
  static canManageStore(user: User | null, store: Store): boolean {
    return this.canAccessStore(user, store);
  }
  
  /**
   * Check if user can add/remove managers
   */
  static canManageManagers(user: User | null, store: Store): boolean {
    if (!user) return false;
    
    // Super admin can manage all
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Store creator can manage managers
    if (store.createdBy === user.id) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get accessible store IDs for survey/analytics filtering
   */
  static getAccessibleStoreIds(user: User | null, stores: Store[]): string[] {
    const accessibleStores = this.filterAccessibleStores(user, stores);
    return accessibleStores.map(store => store.id);
  }
  
  /**
   * Check if user can create stores
   */
  static canCreateStore(user: User | null): boolean {
    if (!user) return false;
    
    // Super admin can create
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Users with subject permission can create
    return user.permissions?.subject === true;
  }
}