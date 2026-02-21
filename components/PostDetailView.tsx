import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { Comment, EnrichedComment } from './Comment';
import { useAuth } from '../src/hooks/useAuth';
import { databaseService } from '../src/services/database';

interface PostDetailViewProps {
    post: Post;
    onBack: () => void;
    onSelectProfile: (id: string) => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack, onSelectProfile }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<EnrichedComment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Carica i commenti reali dal database
    const loadComments = async () => {
        setIsLoading(true);
        try {
            const fetchedComments = await databaseService.getPostComments(post.$id);
            setComments(fetchedComments as unknown as EnrichedComment[]);
        } catch (error) {
            console.error("Errore nel caricamento commenti:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [post.$id]);

    const handlePublishComment = async () => {
        if (!user || !newCommentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await databaseService.createComment(
                post.$id,
                user.$id,
                newCommentText.trim()
            );
            setNewCommentText('');
            await loadComments();
        } catch (error) {
            console.error("Errore nell'aggiunta del commento:", error);
            alert("Impossibile pubblicare il commento. Riprova.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUserAvatar = user 
        ? (user.userType === 'professional' ? user.avatar : user.logo) || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.structureName || 'User')}&background=eff6ff&color=1d4ed8`
        : '';

    return (
        <div className="max-w-3xl mx-auto pb-20 md:pb-8">
            {/* Header navigazione */}
            <div className="sticky top-16 md:top-20 z-30 bg-slate-50/90 backdrop-blur-sm pb-4 pt-2 mb-2">
                <button 
                    onClick={onBack} 
                    className="inline-flex items-center text-slate-600 hover:text-blue-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Torna al feed
                </button>
            </div>

            {/* Post Principale */}
            <PostCard post={post} onNavigate={(_, id) => id && onSelectProfile(id)} />

            {/* Sezione Commenti Espansa */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-extrabold text-slate-800">
                        Commenti <span className="text-slate-500 font-medium text-base ml-1">({comments.length})</span>
                    </h2>
                </div>
                
                {/* Input Nuovo Commento */}
                {user ? (
                    <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <img 
                                src={currentUserAvatar} 
                                alt="Il tuo avatar" 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0" 
                            />
                            <div className="flex-1">
                                <textarea 
                                    placeholder="Scrivi un commento costruttivo..."
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-[15px]"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button 
                                        onClick={handlePublishComment}
                                        disabled={isSubmitting || !newCommentText.trim()}
                                        className="bg-blue-600 text-white font-bold px-6 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            'Pubblica'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center bg-slate-50">
                        <p className="text-slate-600">Devi accedere per poter commentare.</p>
                    </div>
                )}

                {/* Lista dei Commenti */}
                <div className="p-5 sm:p-6 bg-white">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-6">
                            {comments.map(comment => (
                                <Comment 
                                    key={comment.$id} 
                                    comment={comment} 
                                    onSelectProfile={onSelectProfile} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-500 text-lg">Sii il primo a commentare! 💬</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};