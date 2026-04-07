import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';
import type { Post, UserProfile, StructureProfile, Media } from '@/types/types';
import { Icon } from '@/components/ui/Icon';
import { LikesModal } from './LikesModal';

interface PostCardProps {
    post: Post;
    onSelectPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelectPost }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [likes, setLikes] = useState(post.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [author, setAuthor] = useState<UserProfile | StructureProfile | null>(null);

    useEffect(() => {
        let isMounted = true;
        databaseService.getProfile(post.authorId).then(profile => {
            if (isMounted) setAuthor(profile);
        }).catch(() => {});
        return () => { isMounted = false; };
    }, [post.authorId]);

    const formattedDate = new Date(post.$createdAt).toLocaleDateString('it-IT', { 
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    });

    const handleLike = async () => {
        if (!user || isLiking) return;
        setIsLiking(true);
        try {
            const isLikedNow = await databaseService.toggleLike(post.$id, user.$id);
            setLikes(prev => isLikedNow ? prev + 1 : Math.max(0, prev - 1));
        } catch (error) {
            console.error('Errore durante il like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    let displayContent = post.content;
    let extractedMedia: Media[] = [];
    const mediaMatch = displayContent.match(/\[MEDIA\](.*?)\[\/MEDIA\]/);
    if (mediaMatch) {
        try {
            extractedMedia = JSON.parse(mediaMatch[1]);
            displayContent = displayContent.replace(mediaMatch[0], '').trim();
        } catch(e) {}
    }

    const authorName = author ? (author.userType === 'professional' ? `${(author as UserProfile).firstName || ''} ${(author as UserProfile).lastName || ''}`.trim() : (author as StructureProfile).structureName) : 'Membro di SwimIn';
    const authorSubtitle = author ? (author.userType === 'professional' ? (author as UserProfile).title : (author as StructureProfile).structureType) : '';
    const authorAvatar = author ? (author.userType === 'professional' ? (author as UserProfile).avatar : (author as StructureProfile).logo) : '';
    const displayAvatar = authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName || 'U')}&background=eff6ff&color=1d4ed8`;

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-4 overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                    <img 
                        src={displayAvatar} 
                        alt={authorName} 
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => navigate(`/profile/${post.authorId}`)}
                    />
                    <div>
                        <h3 
                            onClick={() => navigate(`/profile/${post.authorId}`)}
                            className="font-bold text-slate-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors"
                        >
                            {authorName}
                        </h3>
                        {authorSubtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{authorSubtitle}</p>}
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Icon type="globe" className="w-3 h-3" /> {formattedDate}
                        </p>
                    </div>
                </div>

                <p 
                    className={`text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px] ${extractedMedia.length > 0 ? 'mb-3' : ''}`}
                    onClick={() => onSelectPost && onSelectPost(post)}
                >
                    {displayContent}
                </p>

                {extractedMedia.length > 0 && (
                    <div 
                        className={`grid gap-1 rounded-xl overflow-hidden cursor-pointer ${extractedMedia.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
                        onClick={() => onSelectPost && onSelectPost(post)}
                    >
                        {extractedMedia.map((m, idx) => (
                            <img key={idx} src={m.url} alt={m.alt || 'Media'} className="w-full h-auto max-h-[400px] object-cover border border-slate-100" loading="lazy" />
                        ))}
                    </div>
                )}

                {(likes > 0 || post.commentsCount > 0) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        {likes > 0 ? (
                            <span onClick={() => setIsLikesModalOpen(true)} className="cursor-pointer hover:text-blue-600 hover:underline flex items-center gap-1.5">
                                <div className="bg-blue-100 p-1 rounded-full"><Icon type="thumb-up" className="w-3 h-3 text-blue-600"/></div>
                                {likes} Consigli
                            </span>
                        ) : <span></span>}
                        {post.commentsCount > 0 && (
                            <span onClick={() => onSelectPost && onSelectPost(post)} className="cursor-pointer hover:text-blue-600 hover:underline">
                                {post.commentsCount} Commenti
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="px-2 py-2 bg-slate-50 border-t border-slate-200 flex justify-around">
                <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors active:scale-95 disabled:opacity-50 outline-none"
                >
                    <Icon type="thumb-up" className="w-5 h-5" /> Consiglia
                </button>
                <button 
                    onClick={() => onSelectPost && onSelectPost(post)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors active:scale-95 outline-none"
                >
                    <Icon type="chat-bubble" className="w-5 h-5" /> Commenta
                </button>
            </div>
            
            {isLikesModalOpen && (
                <LikesModal postId={post.$id} onClose={() => setIsLikesModalOpen(false)} onNavigate={(view, id) => navigate(`/${view}/${id}`)} />
            )}
        </article>
    );
};