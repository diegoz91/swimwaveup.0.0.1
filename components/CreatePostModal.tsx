import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, StructureProfile, Media } from '../types';
import { Icon } from './Icon';
import { PhotoUploader } from './PhotoUploader';
import { storageService } from '@/src/services/storage';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePost: (content: string, media: Media[]) => Promise<void> | void;
    user: UserProfile | StructureProfile;
    initialMediaType?: 'photo' | 'video';
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
    isOpen, 
    onClose, 
    onCreatePost, 
    user, 
    initialMediaType 
}) => {
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<{ file: File, preview: string, alt: string }[]>([]);
    const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(initialMediaType || null);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialMediaType && isOpen) {
            setMediaType(initialMediaType);
        }
    }, [initialMediaType, isOpen]);

    const isProfessional = user.userType === 'professional';
    const authorName = isProfessional 
        ? `${(user as UserProfile).firstName || ''} ${(user as UserProfile).lastName || ''}`.trim() || 'Utente'
        : (user as StructureProfile).structureName || 'Struttura';
    
    const avatarUrl = isProfessional ? (user as UserProfile).avatar : (user as StructureProfile).logo;
    const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=eff6ff&color=1d4ed8`;

    const handleSafeClose = () => {
        if (content.trim() !== '' || mediaFiles.length > 0) {
            if (window.confirm("Hai un post in sospeso. Sei sicuro di voler annullare?")) {
                resetState();
            }
        } else {
            resetState();
        }
    };

    const resetState = () => {
        setContent('');
        setMediaFiles([]);
        setMediaType(null);
        onClose();
    };

    const handleCreatePost = async () => {
        if (!content.trim() && mediaFiles.length === 0) return;

        setUploading(true);
        try {
            let uploadedMedia: Media[] = [];

            if (mediaFiles.length > 0) {
                console.log('📤 Uploading media files to Appwrite...');
                
                const uploadPromises = mediaFiles.map(async (mediaFile) => {
                    const uploadedUrl = await storageService.uploadPostMedia(mediaFile.file);
                    return {
                        type: 'image' as const,
                        url: uploadedUrl,
                        alt: mediaFile.alt || 'Immagine allegata al post',
                    };
                });

                uploadedMedia = await Promise.all(uploadPromises);
            }

            await onCreatePost(content.trim(), uploadedMedia);
            
            resetState();
            
        } catch (error) {
            console.error('Error creating post:', error);
            alert("Si è verificato un errore durante la pubblicazione. Controlla la tua connessione e riprova.");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    const isPostButtonDisabled = (content.trim() === '' && mediaFiles.length === 0) || uploading;

    return (
        <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200" 
            onClick={handleSafeClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-extrabold text-slate-800">Crea un post</h2>
                    <button 
                        onClick={handleSafeClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
                        disabled={uploading}
                    >
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Utente Info */}
                    <div className="flex items-center mb-5">
                        <img 
                            src={displayAvatar} 
                            alt={authorName} 
                            className="w-12 h-12 rounded-full mr-3 object-cover border border-slate-100" 
                        />
                        <div>
                            <p className="font-bold text-slate-800 leading-tight">{authorName}</p>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 w-max">
                                <Icon type="globe" className="w-3 h-3" />
                                Pubblico
                            </div>
                        </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Condividi un pensiero, un traguardo o una novità..."
                        className="w-full border-none focus:ring-0 text-lg sm:text-xl p-0 text-slate-800 placeholder-slate-400 resize-none outline-none min-h-[120px] bg-transparent"
                        rows={5}
                        disabled={uploading}
                    />

                    {/* Moduli Media Aggiuntivi */}
                    {mediaType === 'photo' && (
                        <div className="mt-4">
                            <PhotoUploader files={mediaFiles} setFiles={setMediaFiles} disabled={uploading} />
                        </div>
                    )}
                    
                    {mediaType === 'video' && (
                        <div className="mt-4 p-6 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl text-center flex flex-col items-center justify-center">
                            <Icon type="video" className="w-10 h-10 text-slate-400 mb-2" />
                            <p className="font-semibold text-slate-700">Video in arrivo</p>
                            <p className="text-sm text-slate-500 mt-1">La funzione di upload video sarà disponibile col prossimo aggiornamento.</p>
                        </div>
                    )}

                    {/* Overlay Caricamento */}
                    {uploading && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-b-2xl">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                            <p className="font-bold text-blue-800">Pubblicazione in corso...</p>
                            <p className="text-sm text-slate-500">Non chiudere l'applicazione</p>
                        </div>
                    )}
                </div>

                {/* Footer Toolbar */}
                <div className="p-4 border-t border-slate-100 mt-auto bg-white rounded-b-2xl flex justify-between items-center">
                     <div className="flex items-center space-x-1 sm:space-x-2">
                        <button 
                            onClick={() => setMediaType(mediaType === 'photo' ? null : 'photo')} 
                            className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${mediaType === 'photo' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`} 
                            title="Aggiungi foto"
                            disabled={uploading}
                        >
                            <Icon type="photo" className={`w-6 h-6 ${mediaType !== 'photo' && !uploading ? 'text-green-500' : ''}`}/>
                        </button>
                         <button 
                            onClick={() => setMediaType(mediaType === 'video' ? null : 'video')} 
                            className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${mediaType === 'video' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="Aggiungi video"
                            disabled={uploading}
                        >
                            <Icon type="video" className={`w-6 h-6 ${mediaType !== 'video' && !uploading ? 'text-blue-500' : ''}`}/>
                        </button>
                     </div>
                     <button 
                        onClick={handleCreatePost} 
                        disabled={isPostButtonDisabled}
                        className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm active:scale-95"
                    >
                        {uploading ? 'Attendere...' : 'Pubblica'}
                    </button>
                </div>
            </div>
        </div>
    );
};