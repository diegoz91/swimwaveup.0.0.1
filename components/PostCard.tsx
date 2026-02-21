import React, { useState, useEffect } from 'react';
import type { Post, UserProfile, StructureProfile } from '../types';
import { Icon } from './Icon';
import { useAuth } from '../src/hooks/useAuth';
import { databaseService } from '../src/services/database';

interface PostCardProps {
  post: Post;
  onNavigate?: (view: 'profile' | 'messages', id?: string) => void;
}

const MediaGrid: React.FC<{ post: Post }> = ({ post }) => {
  if (!post.mediaUrls || post.mediaUrls.length === 0) return null;
  
  const validUrls = post.mediaUrls.filter(url => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('blob:')) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  });
  
  if (validUrls.length === 0) return null;
  
  return (
    <div className="border-y border-slate-100 bg-slate-50">
      <img 
        src={validUrls[0]} 
        alt="Media allegato al post" 
        className="w-full h-auto max-h-[60vh] object-contain mx-auto"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ post, onNavigate }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [author, setAuthor] = useState<UserProfile | StructureProfile | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const profile = post.authorType === 'professional' 
            ? await databaseService.getUserProfile(post.authorId)
            : await databaseService.getStructureProfile(post.authorId);
        setAuthor(profile as UserProfile | StructureProfile);
      } catch (error) {
        console.error("Failed to fetch post author");
      }
    };
    if (post.authorId) fetchAuthor();
  }, [post.authorId, post.authorType]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      try {
        const liked = await databaseService.checkUserLiked(post.$id, user.$id);
        setIsLiked(liked);
      } catch (error) {
        console.error("Error checking like status");
      }
    };
    checkLikeStatus();
  }, [post.$id, user]);

  const handleLikeClick = async () => {
    if (!user || isLiking) return;
    try {
      setIsLiking(true);
      const result = await databaseService.toggleLike(post.$id, user.$id);
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error toggling like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: `Post su SwimWaveUp`,
      text: post.content,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      }
    } catch (error) {
      console.error('Errore nella condivisione');
    }
  };

  const isProf = author?.userType === 'professional';
  const authorName = isProf 
    ? `${(author as UserProfile).firstName || ''} ${(author as UserProfile).lastName || ''}`.trim() || 'Utente' 
    : (author as StructureProfile)?.structureName || 'Caricamento...';
    
  const authorAvatar = isProf 
    ? (author as UserProfile).avatar 
    : (author as StructureProfile)?.logo;

  const displayAvatar = authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=eff6ff&color=1d4ed8`;
  const authorTitle = isProf ? ((author as UserProfile).title || 'Professionista') : ((author as StructureProfile)?.structureType || 'Struttura');
  const formattedDate = new Date(post.$createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
      
      {/* Header Post */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <img
                src={displayAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigate?.('profile', post.authorId)}
            />
            <div>
                <p 
                    className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                    onClick={() => onNavigate?.('profile', post.authorId)}
                >
                    {authorName}
                </p>
                <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <span className="truncate max-w-[150px] sm:max-w-[300px]">{authorTitle}</span>
                    <span className="mx-1.5">•</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
            </div>
            {/* Opzioni post */}
            <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors">
                <Icon type="ellipsis" className="w-5 h-5" />
            </button>
        </div>
        
        {/* Contenuto */}
        <p className="text-slate-800 whitespace-pre-wrap mt-4 text-[15px] leading-relaxed">
            {post.content}
        </p>
      </div>

      <MediaGrid post={post} />

      {/* Social Stats */}
      <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center text-slate-500 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="bg-blue-50 p-1 rounded-full">
            <Icon type="like" className="w-3.5 h-3.5 text-blue-600 fill-current" />
          </div>
          <span className="font-medium">{likesCount}</span>
        </div>
        <div className="flex items-center gap-4 hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
          <span>{commentsCount} {commentsCount === 1 ? 'Commento' : 'Commenti'}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-2 py-1.5 border-t border-slate-100 flex gap-1">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
            isLiked ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
          } ${isLiking ? 'opacity-50' : 'active:scale-95'}`}
        >
          <Icon type="like" className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{isLiked ? 'Ti piace' : 'Consiglia'}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Icon type="comment" className="w-5 h-5" />
          <span className="hidden sm:inline">Commenta</span>
        </button>
        
        <button 
          onClick={handleShareClick}
          className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Icon type="share" className="w-5 h-5" />
          <span className="hidden sm:inline">Condividi</span>
        </button>
      </div>
    </div>
  );
};