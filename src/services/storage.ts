import { ID } from 'appwrite';
import { storage } from '@/services/appwrite';
import { APPWRITE_CONFIG } from '@/config/constants';

class StorageService {
  private storage = storage;
  private buckets = APPWRITE_CONFIG.buckets;

  // ==================== AVATAR & LOGO UPLOAD ====================\
  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      this.validateImageFile(file, 5); // Max 5MB
      
      const fileId = ID.unique();
      const uploadResult = await this.storage.createFile(this.buckets.avatars, fileId, file);
      
      return this.storage.getFileView(this.buckets.avatars, uploadResult.$id).toString();
    } catch (error) {
      console.error('StorageService - uploadAvatar Error:', error);
      throw error;
    }
  }

  // ==================== POST MEDIA UPLOAD ====================\
  async uploadPostMedia(file: File): Promise<string> {
    try {
      if (file.type.startsWith('image/')) {
        this.validateImageFile(file, 10); // Max 10MB per foto nei post
      } else if (file.type.startsWith('video/')) {
        this.validateVideoFile(file, 50); // Max 50MB per video nei post
      } else {
        throw new Error('Tipo di file non supportato. Puoi caricare solo immagini o video.');
      }

      const fileId = ID.unique();
      const uploadResult = await this.storage.createFile(this.buckets.postMedia, fileId, file);
      
      return this.storage.getFileView(this.buckets.postMedia, uploadResult.$id).toString();
    } catch (error) {
      console.error('StorageService - uploadPostMedia Error:', error);
      throw error;
    }
  }

  // ==================== FILE MANAGEMENT ====================\
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await this.storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('StorageService - deleteFile Error:', error);
      throw error;
    }
  }

  // ==================== VALIDATION HELPERS ====================\
  private validateImageFile(file: File, maxSizeMB: number): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato immagine non supportato. Usa JPG, PNG o WebP.');
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Immagine troppo grande. La dimensione massima consentita è ${maxSizeMB}MB.`);
    }
    return true;
  }

  private validateVideoFile(file: File, maxSizeMB: number): boolean {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato video non supportato. Usa MP4, MOV, AVI o WebM.');
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Video troppo grande. La dimensione massima consentita è ${maxSizeMB}MB.`);
    }
    return true;
  }
}

export const storageService = new StorageService();