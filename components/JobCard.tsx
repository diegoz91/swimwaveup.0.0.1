import React from 'react';
import type { Job, StructureProfile } from '../types';
import { Icon } from './Icon';

interface JobCardProps {
    job: Job;
    structure?: StructureProfile | null;
    onSelectJob?: (id: string) => void;
    onApply?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, structure, onSelectJob, onApply }) => {
    // Formatta la data
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Data non disponibile';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data non disponibile';
            
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Oggi';
            if (diffDays === 1) return 'Ieri';
            if (diffDays < 7) return `${diffDays} giorni fa`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
            
            return date.toLocaleDateString('it-IT', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        } catch {
            return 'Data non disponibile';
        }
    };

    // Genera avatar di fallback per la struttura
    const structureLogo = structure?.logo || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(structure?.structureName || job.title || 'Job')}&background=3b82f6&color=fff`;
    
    const structureName = structure?.structureName || 'Struttura';

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <img 
                            src={structureLogo} 
                            alt={structureName} 
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0" 
                        />
                        <div className="min-w-0">
                            <h2 
                                className="text-lg font-bold text-slate-800 hover:text-blue-600 cursor-pointer truncate" 
                                onClick={() => onSelectJob?.(job.$id)}
                            >
                                {job.title}
                            </h2>
                            <p className="text-md text-slate-600 truncate">{structureName}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                {job.city && (
                                    <span className="flex items-center">
                                        <Icon type="location" className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span className="truncate">{job.city}{job.province ? `, ${job.province}` : ''}</span>
                                    </span>
                                )}
                                {job.contractType && (
                                    <span className="flex items-center">
                                        <Icon type="clock" className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span>{job.contractType}</span>
                                    </span>
                                )}
                                {(job.salaryMin || job.salaryMax) && (
                                    <span className="flex items-center">
                                        <Icon type="star" className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span>
                                            {job.salaryMin && job.salaryMax 
                                                ? `€${job.salaryMin} - €${job.salaryMax}`
                                                : job.salaryMin 
                                                    ? `Da €${job.salaryMin}`
                                                    : `Fino a €${job.salaryMax}`
                                            }
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0">
                        <Icon type="heart" className="w-6 h-6"/>
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                    Pubblicato {formatDate(job.$createdAt)}
                </p>
            </div>
            <div className="border-t border-slate-200 p-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                <button 
                    onClick={() => onSelectJob?.(job.$id)} 
                    className="w-full sm:w-auto text-center bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-full hover:bg-slate-100 transition text-sm"
                >
                    Dettagli
                </button>
                <button 
                    onClick={() => onApply?.(job)} 
                    className="w-full sm:w-auto text-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition text-sm"
                >
                    Candidati Ora
                </button>
            </div>
        </div>
    );
};