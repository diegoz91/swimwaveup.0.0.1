// src/services/storage.ts
import { storage } from './appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';
import { errorHandler } from '../utils/errorHandler';
import { ID } from 'appwrite';

class StorageService {
  private storage = storage;
  private buckets = APPWRITE_CONFIG.buckets;

  // ==================== AVATAR UPLOAD ====================
  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      console.log('📤 Uploading avatar for user:', userId);
      this.validateImageFile(file, 5); // 5MB max
      
      const fileId = `avatar_${userId}_${Date.now()}`;
      const uploadResult = await this.storage.createFile(this.buckets.avatars, fileId, file);
      
      console.log('✅ Avatar uploaded successfully');
      return this.storage.getFileView(this.buckets.avatars, uploadResult.$id);
    } catch (error) {
      errorHandler.logAppwriteError(error as Error, 'uploadAvatar');
      throw error;
    }
  }

  // ==================== POST MEDIA UPLOAD ====================
  async uploadPostMedia(file: File): Promise<string> {
    try {
      console.log('📤 Uploading post media:', file.name);
      if (file.type.startsWith('image/')) {
        this.validateImageFile(file, 10); // 10MB max for images
      } else if (file.type.startsWith('video/')) {
        this.validateVideoFile(file, 50); // 50MB max for videos
      } else {
        throw new Error('Unsupported file type');
      }
      
      const fileId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const uploadResult = await this.storage.createFile(this.buckets.posts, fileId, file);

      console.log('✅ Post media uploaded successfully');
      return this.storage.getFileView(this.buckets.posts, uploadResult.$id);
    } catch (error) {
      errorHandler.logAppwriteError(error as Error, 'uploadPostMedia');
      throw error;
    }
  }
  
    // ==================== DOCUMENT UPLOAD ====================
  async uploadDocument(file: File, userId: string, documentType = 'general') {
    try {
      console.log('📄 Uploading document:', file.name);
      
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Only PDF files are supported for documents');
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('File too large. Max 10MB for documents.');
      }
      
      const fileId = `doc_${userId}_${documentType}_${Date.now()}`;
      const uploadResult = await this.storage.createFile(this.buckets.documents, fileId, file);
      
      const fileUrl = this.storage.getFileView(this.buckets.documents, uploadResult.$id);
      
      console.log('✅ Document uploaded successfully');
      return { url: fileUrl, name: file.name, size: file.size, type: documentType };
    } catch (error) {
      errorHandler.logAppwriteError(error as Error, 'uploadDocument');
      throw error;
    }
  }


  // ==================== VALIDATION HELPERS ====================
  private validateImageFile(file: File, maxSizeMB: number) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image format. Use JPG, PNG, or WebP.');
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Image too large. Max ${maxSizeMB}MB.`);
    }
    return true;
  }

  private validateVideoFile(file: File, maxSizeMB: number) {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported video format. Use MP4, MOV, AVI, or WebM.');
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Video too large. Max ${maxSizeMB}MB.`);
    }
    return true;
  }

  // ==================== FILE MANAGEMENT ====================
  async deleteFile(bucketId: string, fileId: string) {
    try {
      await this.storage.deleteFile(bucketId, fileId);
      console.log('🗑️ File deleted:', fileId);
    } catch (error) {
      errorHandler.logAppwriteError(error as Error, 'deleteFile');
      throw error;
    }
  }
}

export const storageService = new StorageService();