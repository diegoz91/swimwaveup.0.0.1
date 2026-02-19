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
  
  // Filtra URL non validi (blob, vuoti, malformati)
  const validUrls = post.mediaUrls.filter(url => {
    if (!url || typeof url !== 'string') return false;
    
    // Esclude URL blob che causano errori
    if (url.startsWith('blob:')) return false;
    
    // Accetta solo URL HTTP/HTTPS validi o percorsi relativi
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('/');
  });
  
  // Se non ci sono URL validi, non mostrare nulla
  if (validUrls.length === 0) return null;
  
  return (
    <div>
      <img 
        src={validUrls[0]} 
        alt="Post media" 
        className="w-full h-auto max-h-[70vh] object-cover"
        onError={(e) => {
          // Nasconde l'immagine se non può essere caricata
          e.currentTarget.style.display = 'none';
          console.log('Failed to load image:', validUrls[0]);
        }}
        onLoad={() => {
          // Assicura che l'immagine sia visibile se carica correttamente
          console.log('Image loaded successfully:', validUrls[0]);
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
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Fetch author
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        let profile;
        if (post.authorType === 'professional') {
          profile = await databaseService.getUserProfile(post.authorId);
        } else {
          profile = await databaseService.getStructureProfile(post.authorId);
        }
        setAuthor(profile as UserProfile | StructureProfile);
      } catch (error) {
        console.error("Failed to fetch post author:", error);
      }
    };

    if (post.authorId) {
      fetchAuthor();
    }
  }, [post.authorId, post.authorType]);

  // Check if user liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;

      try {
        const liked = await databaseService.checkUserLiked(post.$id, user.$id);
        setIsLiked(liked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [post.$id, user]);

  // Handle like/unlike
  const handleLikeClick = async () => {
    if (!user || isLiking) return;

    try {
      setIsLiking(true);
      const result = await databaseService.toggleLike(post.$id, user.$id);

      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Load comments
  const loadComments = async () => {
    try {
      const postComments = await databaseService.getPostComments(post.$id);
      setComments(postComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Toggle comments visibility
  const handleCommentsClick = async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isAddingComment) return;

    try {
      setIsAddingComment(true);

      await databaseService.createComment(
        post.$id,
        user.$id,
        newComment.trim()
      );

      setNewComment('');
      setCommentsCount(prev => prev + 1);

      // Reload comments
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Errore nell'aggiunta del commento");
    } finally {
      setIsAddingComment(false);
    }
  };

  // Handle share click
  const handleShareClick = async () => {
    const shareData = {
      title: `Post di ${authorName}`,
      text: post.content,
      url: window.location.href
    };

    try {
      // Prova prima con l'API nativa di condivisione (mobile/browser moderni)
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Post condiviso con successo');
      } else {
        // Fallback: copia il link negli appunti
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      }
    } catch (error) {
      console.error('Errore nella condivisione:', error);
      // Fallback finale: copia manuale
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      } catch (clipboardError) {
        alert('Impossibile condividere il post');
      }
    }
  };

  const isProfessional = (p: UserProfile | StructureProfile | null): p is UserProfile => !!p && 'firstName' in p;
  const isStructure = (p: UserProfile | StructureProfile | null): p is StructureProfile => !!p && 'structureName' in p;

  const authorName = isProfessional(author) ? `${author.firstName} ${author.lastName}` : isStructure(author) ? author.structureName : 'Loading...';
  const authorAvatar = isProfessional(author) ? author.avatar : isStructure(author) ? author.logo : '/default-avatar.png';
  const authorTitle = author ? post.authorType : '';

  return (
    <div className="card card-post card-interactive">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img
            src={authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=fff`}
            alt={authorName}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <p className="font-bold text-slate-800">{authorName}</p>
            <p className="text-sm text-slate-500">{authorTitle} • {new Date(post.$createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      <MediaGrid post={post} />

      {/* Stats */}
      <div className="p-2 sm:p-4 border-t border-slate-200 flex justify-between items-center text-slate-600 text-sm">
        <div className="flex items-center space-x-1">
          <Icon type="like" className="w-5 h-5 text-blue-500" />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{commentsCount} Commenti</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-slate-50 p-1 sm:p-2 border-t border-slate-200">
        <div className="flex space-x-1 sm:space-x-2 text-slate-600 font-semibold">
          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className={`flex-1 p-2 rounded-md hover:bg-slate-200 flex items-center justify-center space-x-2 ${isLiked ? 'text-blue-600' : ''
              } ${isLiking ? 'opacity-50' : ''}`}
          >
            <Icon type="like" className="w-6 h-6" />
            <span>{isLiked ? 'Ti piace' : 'Mi piace'}</span>
          </button>
          <button
            onClick={handleCommentsClick}
            className="flex-1 p-2 rounded-md hover:bg-slate-200 flex items-center justify-center space-x-2"
          >
            <Icon type="comment" className="w-6 h-6" />
            <span>Commenta</span>
          </button>
          <button 
            onClick={handleShareClick}
            className="flex-1 p-2 rounded-md hover:bg-slate-200 flex items-center justify-center space-x-2"
          >
            <Icon type="share" className="w-6 h-6" />
            <span>Condividi</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-200 p-4">
          {/* Add comment */}
          {user && (
            <div className="flex items-start space-x-3 mb-4">
              <img
                src={user.userType === 'professional'
                  ? user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=3b82f6&color=fff`
                  : user.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.structureName || 'User')}&background=3b82f6&color=fff`
                }
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={2}
                  disabled={isAddingComment}
                />
                {newComment.trim() && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={isAddingComment}
                      className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAddingComment ? 'Invio...' : 'Pubblica'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.$id} className="flex items-start space-x-3">
                <img
                  src={comment.author
                    ? (comment.authorType === 'professional'
                      ? comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.firstName + ' ' + comment.author.lastName)}&background=3b82f6&color=fff`
                      : comment.author.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.structureName)}&background=3b82f6&color=fff`
                    )
                    : '/default-avatar.png'
                  }
                  alt="Commenter"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-slate-100 rounded-xl p-3">
                    <p className="font-semibold text-slate-800 text-sm">
                      {comment.author
                        ? (comment.authorType === 'professional'
                          ? `${comment.author.firstName} ${comment.author.lastName}`
                          : comment.author.structureName
                        )
                        : 'Utente sconosciuto'
                      }
                    </p>
                    <p className="text-slate-700 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1 px-2">
                    <span>{new Date(comment.$createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-slate-500 py-4">Nessun commento ancora.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};