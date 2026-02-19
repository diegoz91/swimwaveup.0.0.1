import React, { useState, useRef, useEffect } from 'react';
import type { ProfessionalUser, Media } from '../types';
import { Icon } from './Icon';
import { PhotoUploader } from './PhotoUploader';
import { storageService } from '@/src/services/storage';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePost: (content: string, media: Media[]) => void;
    user: ProfessionalUser;
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

    useEffect(() => {
        if (initialMediaType) {
            setMediaType(initialMediaType);
            if(fileInputRef.current) {
                fileInputRef.current.click();
            }
        }
    }, [initialMediaType]);

    if (!isOpen) return null;

    const handleCreatePost = async () => {
        setUploading(true);
        try {
            let uploadedMedia: Media[] = [];

            // Se ci sono file da uploadare, caricali prima
            if (mediaFiles.length > 0) {
                console.log('📤 Uploading media files...');
                
                const uploadPromises = mediaFiles.map(async (mediaFile) => {
                    try {
                        // Upload del file usando storageService
                        const uploadedUrl = await storageService.uploadPostMedia(mediaFile.file);
                        
                        return {
                            type: 'image' as const,
                            url: uploadedUrl,
                            alt: mediaFile.alt || 'Uploaded image',
                        };
                    } catch (error) {
                        console.error('Error uploading file:', error);
                        throw error;
                    }
                });

                uploadedMedia = await Promise.all(uploadPromises);
                console.log('✅ Media uploaded successfully:', uploadedMedia);
            }

            // Crea il post con gli URL reali
            onCreatePost(content, uploadedMedia);
            resetState();
            
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Errore durante l\'upload delle immagini. Riprova.');
        } finally {
            setUploading(false);
        }
    };

    const resetState = () => {
        setContent('');
        setMediaFiles([]);
        setMediaType(null);
        onClose();
    }

    const isPostButtonDisabled = (content.trim() === '' && mediaFiles.length === 0) || uploading;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={resetState}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Crea un post</h2>
                    <button onClick={resetState} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    <div className="flex items-center mb-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-3" />
                        <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-sm text-slate-500">Pubblica per tutti</p>
                        </div>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Di cosa vorresti parlare?"
                        className="w-full border-none focus:ring-0 text-lg p-2 text-black resize-none"
                        rows={5}
                        disabled={uploading}
                    />

                    {mediaType === 'photo' && (
                        <PhotoUploader files={mediaFiles} setFiles={setMediaFiles} disabled={uploading} />
                    )}
                    
                    {mediaType === 'video' && (
                         <div className="p-4 my-2 border rounded-lg text-center text-slate-500">
                             La funzione di caricamento video sarà disponibile a breve.
                         </div>
                    )}

                    {/* Mostra stato di upload */}
                    {uploading && (
                        <div className="p-4 my-2 border rounded-lg text-center text-blue-600 bg-blue-50">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            Caricamento in corso...
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 mt-auto">
                    <div className="flex justify-between items-center">
                         <div className="flex items-center space-x-1">
                            <button 
                                onClick={() => setMediaType('photo')} 
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full disabled:opacity-50" 
                                aria-label="Aggiungi foto"
                                disabled={uploading}
                            >
                                <Icon type="photo" className="w-6 h-6 text-green-500"/>
                            </button>
                             <button 
                                onClick={() => setMediaType('video')} 
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full disabled:opacity-50" 
                                aria-label="Aggiungi video"
                                disabled={uploading}
                            >
                                <Icon type="video" className="w-6 h-6 text-blue-500"/>
                            </button>
                         </div>
                         <button 
                            onClick={handleCreatePost} 
                            disabled={isPostButtonDisabled}
                            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Caricamento...' : 'Pubblica'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};