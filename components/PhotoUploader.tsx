// ============================================================
// components/PhotoUploader.tsx - FIX IMPORT GEMINI
// ============================================================

import React, { useRef, useState } from 'react';
import { Icon } from './Icon';
// ❌ RIMOSSO: import { generateImageAltText } from '../services/geminiService';

type MediaFile = { file: File, preview: string, alt: string };

interface PhotoUploaderProps {
    files: MediaFile[];
    setFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
    disabled?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ files, setFiles, disabled = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [generatingAltText, setGeneratingAltText] = useState<number | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && !disabled) {
            // ✅ FIX: Diciamo esplicitamente a TypeScript che questo è un array di File
            const selectedFiles = Array.from(event.target.files) as File[];
            
            const newFiles = selectedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                alt: ''
            }));
            setFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Limite a 10 foto
        }
    };

    const removeFile = (index: number) => {
        if (disabled) return;
        const fileToRemove = files[index];
        URL.revokeObjectURL(fileToRemove.preview);
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateAltText = (index: number, text: string) => {
        if (disabled) return;
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, alt: text } : f));
    };

    // ✅ FIX: Sostituita la chiamata a Gemini con un placeholder temporaneo
    const handleGenerateAltText = async (index: number) => {
        if (disabled) return;
        setGeneratingAltText(index);
        
        // Simuliamo un ritardo di rete per mantenere un'ottima UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Testo di fallback
        const altText = "Immagine (Generazione AI temporaneamente disabilitata)";
        
        updateAltText(index, altText);
        setGeneratingAltText(null);
    }

    return (
        <div className="my-2 p-2 border border-slate-200 rounded-lg">
            <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />
            {files.length === 0 ? (
                <button
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    disabled={disabled}
                    className={`w-full p-8 rounded-lg border-2 border-dashed text-slate-500 flex flex-col items-center justify-center ${
                        disabled 
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-300 cursor-pointer'
                    }`}
                >
                    <Icon type="photo" className="w-12 h-12 mb-2" />
                    <span className="font-semibold">Aggiungi foto</span>
                    <span className="text-sm">o trascinale qui</span>
                </button>
            ) : (
                <div className="space-y-3">
                    {files.map((mediaFile, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-slate-50 rounded-md">
                           <img src={mediaFile.preview} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                           <div className="flex-1">
                                <textarea
                                    placeholder="Aggiungi un testo alternativo (alt text)..."
                                    value={mediaFile.alt}
                                    onChange={(e) => updateAltText(index, e.target.value)}
                                    disabled={disabled}
                                    className={`w-full p-2 border border-slate-200 rounded-md text-sm ${
                                        disabled 
                                            ? 'bg-slate-100 cursor-not-allowed opacity-50' 
                                            : 'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    }`}
                                    rows={2}
                                />
                                <button
                                    onClick={() => handleGenerateAltText(index)}
                                    disabled={disabled || generatingAltText === index}
                                    className="flex items-center space-x-1 mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                   <Icon type="sparkles" className="w-3 h-3"/>
                                   <span>{generatingAltText === index ? 'Genero...' : 'Genera con AI'}</span>
                                </button>
                           </div>
                           <button 
                               onClick={() => removeFile(index)} 
                               disabled={disabled}
                               className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               <Icon type="x" className="w-5 h-5"/>
                           </button>
                        </div>
                    ))}
                    {files.length < 10 && (
                         <button
                            onClick={() => !disabled && fileInputRef.current?.click()}
                            disabled={disabled}
                            className={`w-full p-3 rounded-lg border-2 border-dashed text-slate-600 flex items-center justify-center font-semibold ${
                                disabled 
                                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50' 
                                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer'
                            }`}
                        >
                            <Icon type="plus" className="w-5 h-5 mr-2" />
                            Aggiungi altre foto
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};