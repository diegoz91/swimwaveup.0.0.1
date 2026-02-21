import React, { useState, useRef, useEffect } from 'react';
import { databaseService } from '../../services/database';
import { storageService } from '../../services/storage';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHandler } from '../../utils/errorHandler';
import type { Post, UserProfile, StructureProfile } from '@/types';
import { Icon } from '../../../components/Icon';

interface PostCreatorProps {
    onPostCreated?: (newPost: Post) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { logError } = useErrorHandler();
  
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) alert(`Il file ${file.name} non è supportato. Usa JPG, PNG o WebP.`);
      if (!isValidSize) alert(`Il file ${file.name} è troppo grande (Max 5MB).`);
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    URL.revokeObjectURL(previews[indexToRemove]);
    setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleCreatePost = async () => {
    if ((!content.trim() && selectedFiles.length === 0) || !user) return;
    
    setUploading(true);
    try {
      let uploadedUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        console.log('📤 Uploading media files to Appwrite...');
        const uploadPromises = selectedFiles.map(file => storageService.uploadPostMedia(file));
        uploadedUrls = await Promise.all(uploadPromises);
      }

      const postData: Partial<Post> = {
        authorId: user.$id,
        authorType: user.userType,
        content: content.trim(),
        postType: (uploadedUrls.length > 0 ? 'image' : 'text') as 'image' | 'text',
        mediaUrls: uploadedUrls,
        visibility: 'public' as const
      };

      const newPost = await databaseService.createPost(postData);
      
      setContent('');
      setSelectedFiles([]);
      previews.forEach(url => URL.revokeObjectURL(url));
      setPreviews([]);
      
      if (onPostCreated) {
        onPostCreated(newPost as Post);
      }
      
    } catch (error) {
      logError(error as Error, 'handleCreatePost');
      alert('Errore durante la pubblicazione. Riprova più tardi.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const isProfessional = user.userType === 'professional';
  const displayName = isProfessional 
    ? `${(user as UserProfile).firstName || ''} ${(user as UserProfile).lastName || ''}`.trim() || 'Utente'
    : (user as StructureProfile).structureName || 'Struttura';
  
  const rawAvatar = isProfessional ? (user as UserProfile).avatar : (user as StructureProfile).logo;
  const avatarUrl = rawAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=1d4ed8`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      <div className="flex gap-4">
        {/* Avatar */}
        <img 
          src={avatarUrl} 
          alt={displayName} 
          className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0" 
        />
        
        {/* Area Testo */}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`A cosa stai pensando, ${displayName.split(' ')[0]}?`}
            disabled={uploading}
            className="w-full bg-transparent resize-none outline-none text-slate-800 placeholder-slate-400 text-lg min-h-[60px] pt-2"
            maxLength={2000}
            rows={content.split('\n').length > 2 ? 4 : 2}
          />
        </div>
      </div>

      {/* Anteprima Media Selezionati */}
      {previews.length > 0 && (
        <div className="mt-4 ml-16 flex flex-wrap gap-3">
          {previews.map((previewUrl, index) => (
            <div key={index} className="relative group">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-24 w-auto object-cover rounded-lg border border-slate-200"
              />
              <button
                onClick={() => removeFile(index)}
                disabled={uploading}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-slate-900"
                aria-label="Rimuovi immagine"
              >
                <Icon type="x" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Barra delle Azioni Inferiore */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 ml-0 sm:ml-16">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-slate-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Aggiungi Foto"
          >
            <Icon type="photo" className="w-6 h-6" />
            <span className="text-sm font-semibold hidden sm:inline">Foto</span>
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept="image/jpeg,image/png,image/webp" 
            onChange={(e) => handleFileSelect(e.target.files)} 
            className="hidden" 
          />
        </div>
        
        <button
          onClick={handleCreatePost}
          disabled={(!content.trim() && selectedFiles.length === 0) || uploading}
          className="bg-blue-600 text-white font-bold px-6 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              Pubblicazione...
            </>
          ) : (
            <>
              <Icon type="send" className="w-4 h-4" />
              Pubblica
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostCreator;