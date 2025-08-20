import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function generateStoreQRUrl(storeId: string): string {
  return `${window.location.origin}/survey/${storeId}`;
}

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Function untuk upload logo store
export const uploadStoreLogo = async (file: File, storeId: string): Promise<string> => {
  try {
    // Validasi file
    if (!file.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Ukuran file maksimal 5MB');
    }

    // Create reference dengan nama file yang unik
    const fileExtension = file.name.split('.').pop();
    const fileName = `store-logo-${storeId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `store-logos/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};

// Function untuk hapus logo lama
export const deleteStoreLogo = async (logoUrl: string): Promise<void> => {
  try {
    if (logoUrl && logoUrl.includes('firebase')) {
      const logoRef = ref(storage, logoUrl);
      await deleteObject(logoRef);
    }
  } catch (error) {
    console.error('Error deleting old logo:', error);
    // Don't throw error, just log it
  }
};