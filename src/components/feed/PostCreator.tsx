// src/components/feed/PostCreator.tsx
import React, { useState } from 'react';
import { databaseService } from '../../services/database';
import { storageService } from '../../services/storage';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHandler } from '../../utils/errorHandler';
import { Post } from '@/types';


interface PostCreatorProps {
    onPostCreated?: (newPost: Post) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { logError } = useErrorHandler();

  const handleMediaUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      console.log('📤 Uploading media files...');
      const uploadPromises = Array.from(files).map(file => 
        storageService.uploadPostMedia(file)
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setMediaUrls(prev => [...prev, ...uploadedUrls]);
      console.log('✅ Media uploaded:', uploadedUrls);
    } catch (error) {
      logError(error as Error, 'handleMediaUpload');
      alert('Error during upload. Please try again.');
    } finally {
        setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;
    
    setUploading(true);
    try {
      const postData = {
        authorId: user.$id,
        authorType: user.userType,
        content: content.trim(),
        postType: mediaUrls.length > 0 ? 'image' : 'text',
        mediaUrls: mediaUrls,
        visibility: 'public'
      };

      const newPost = await databaseService.createPost(postData);
      console.log('✅ Post created successfully');
      
      setContent('');
      setMediaUrls([]);
      onPostCreated?.(newPost as Post);
      
    } catch (error) {
      logError(error as Error, 'handleCreatePost');
      alert('Error during publishing. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="post-creator">
      <div className="post-creator-header">
        <img src={ (user as any).avatar || '/default-avatar.png' } alt="Avatar" />
        <span>{(user as any).name || 'User'}</span>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share an update with the community..."
        maxLength={2000}
        rows={3}
      />
      
      <div className="post-creator-actions">
        <div className="media-buttons">
          <label className="media-button">
            📷 Photo
            <input type="file" multiple accept="image/*" onChange={(e) => handleMediaUpload(e.target.files)} hidden />
          </label>
        </div>
        
        <button
          onClick={handleCreatePost}
          disabled={!content.trim() || uploading}
          className="publish-button"
        >
          {uploading ? '📤 Publishing...' : '🚀 Publish'}
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
