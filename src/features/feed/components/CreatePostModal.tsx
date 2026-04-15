import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, StructureProfile, Media } from '@/types/types';
import { Icon } from '@/components/ui/Icon';
import { PhotoUploader } from '@/features/profile/components/PhotoUploader';
import { storageService } from '@/services/storage';
import { useToast } from '@/context/ToastContext';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePost: (content: string, media: Media[], category: string) => Promise<void> | void;
    user: UserProfile | StructureProfile;
    initialMediaType?: 'photo' | null;
}

const CATEGORIES = [
    { id: 'generale', label: 'Generale', icon: 'globe' },
    { id: 'allenamento', label: 'Allenamento', icon: 'clock' },
    { id: 'gara', label: 'Gara & Risultati', icon: 'star' },
    { id: 'tecnica', label: 'Tecnica & Formazione', icon: 'certificate' },
    { id: 'normative', label: 'Normative & Sicurezza', icon: 'info' }
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
    isOpen, onClose, onCreatePost, user, initialMediaType 
}) => {
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<{ file: File, preview: string, alt: string }[]>([]);
    const [mediaType, setMediaType] = useState<'photo' | null>(initialMediaType || null);
    const [selectedCategory, setSelectedCategory] = useState('generale');
    const [uploading, setUploading] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) setTimeout(() => textareaRef.current?.focus(), 100);
    }, [isOpen]);

    const isProfessional = user.userType === 'professional';
    const authorName = isProfessional ? `${(user as UserProfile).firstName || ''} ${(user as UserProfile).lastName || ''}`.trim() : (user as StructureProfile).structureName;
    const avatarUrl = isProfessional ? (user as UserProfile).avatar : (user as StructureProfile).logo;
    const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName || 'U')}&background=eff6ff&color=1d4ed8`;

    const handleSafeClose = () => {
        if (content.trim() !== '' || mediaFiles.length > 0) {
            if (window.confirm("Hai un post in sospeso. Sei sicuro di voler annullare?")) onClose();
        } else {
            onClose();
        }
    };

    const handleCreatePost = async () => {
        if (!content.trim() && mediaFiles.length === 0) return;
        setUploading(true);
        try {
            let uploadedMedia: Media[] = [];
            if (mediaFiles.length > 0) {
                const uploadPromises = mediaFiles.map(async (mediaFile) => {
                    const uploadedUrl = await storageService.uploadPostMedia(mediaFile.file);
                    return { type: 'image' as const, url: uploadedUrl, alt: mediaFile.alt };
                });
                uploadedMedia = await Promise.all(uploadPromises);
            }
            await onCreatePost(content.trim(), uploadedMedia, selectedCategory);
            showToast('Post pubblicato con successo!', 'success');
        } catch (error) {
            showToast("Errore durante la pubblicazione.", "error");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;
    const isPostButtonDisabled = (content.trim() === '' && mediaFiles.length === 0) || uploading;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200" onClick={handleSafeClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-extrabold text-slate-800">Crea un post</h2>
                    <button onClick={handleSafeClose} disabled={uploading} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 relative">
                    <div className="flex items-center mb-5">
                        <img src={displayAvatar} alt="Avatar" className="w-12 h-12 rounded-full mr-3 object-cover border border-slate-100" />
                        <div>
                            <p className="font-bold text-slate-800 leading-tight">{authorName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {CATEGORIES.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border transition-colors ${selectedCategory === cat.id ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        <Icon type={cat.icon as any} className="w-3 h-3" /> {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Condividi un pensiero, un traguardo o una novità..."
                        className="w-full border-none focus:ring-0 text-lg sm:text-xl p-0 text-slate-800 placeholder-slate-400 resize-none outline-none min-h-[120px] bg-transparent"
                        disabled={uploading}
                    />

                    {mediaType === 'photo' && (
                        <div className="mt-4 animate-in fade-in duration-300">
                            <PhotoUploader files={mediaFiles} setFiles={setMediaFiles} disabled={uploading} />
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                            <p className="font-bold text-blue-800">Pubblicazione in corso...</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto bg-white rounded-b-2xl flex justify-between items-center">
                     <div className="flex items-center space-x-1">
                        <button onClick={() => setMediaType(mediaType === 'photo' ? null : 'photo')} disabled={uploading} className={`p-2.5 rounded-full ${mediaType === 'photo' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <Icon type="photo" className="w-6 h-6"/>
                        </button>
                     </div>
                     <button onClick={handleCreatePost} disabled={isPostButtonDisabled} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50">
                        {uploading ? 'Attendere...' : 'Pubblica'}
                    </button>
                </div>
            </div>
        </div>
    );
};