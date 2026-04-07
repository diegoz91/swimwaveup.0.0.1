import React, { useMemo } from 'react';
import type { Job, StructureProfile } from '@/types/types';
import { Icon } from '@/components/ui/Icon';

interface JobCardProps {
    job: Job;
    structure?: StructureProfile | null;
    onSelectJob?: (id: string) => void;
    onApply?: (job: Job) => void;
}

const formatRelativeDate = (dateString?: string) => {
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
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} sett. fa`;
        
        return date.toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch {
        return 'Data non disponibile';
    }
};

const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const JobCard: React.FC<JobCardProps> = ({ job, structure, onSelectJob, onApply }) => {
    
    const { structureName, structureLogo } = useMemo(() => {
        const name = structure?.structureName || job.structureName || 'Struttura Non Specificata';
        const logo = structure?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;
        return { structureName: name, structureLogo: logo };
    }, [structure, job.structureName]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full group">
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-4">
                    {/* Area Logo e Titoli */}
                    <div className="flex items-start space-x-4 min-w-0">
                        <img 
                            src={structureLogo} 
                            alt={`Logo di ${structureName}`} 
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0 bg-slate-50" 
                            loading="lazy"
                        />
                        <div className="min-w-0">
                            <h3 
                                className="text-lg font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-tight mb-1 outline-none focus-visible:underline" 
                                onClick={() => onSelectJob?.(job.$id)}
                                title={job.title}
                            >
                                {job.title}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 truncate" title={structureName}>
                                {structureName}
                            </p>
                        </div>
                    </div>
                    
                    {/* Azione Rapida: Salva Annuncio */}
                    <button 
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label="Salva questo annuncio"
                        title="Salva"
                    >
                        <Icon type="heart" className="w-5 h-5"/>
                    </button>
                </div>
                
                {/* Meta Tags del Lavoro */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 mt-4">
                    {job.role && (
                        <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                            {capitalize(job.role)}
                        </span>
                    )}
                    {job.contractType && (
                        <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md">
                            <Icon type="briefcase" className="w-3.5 h-3.5 mr-1" />
                            {capitalize(job.contractType)}
                        </span>
                    )}
                    {job.city && (
                        <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md">
                            <Icon type="location" className="w-3.5 h-3.5 mr-1" />
                            <span className="truncate max-w-[120px]">{capitalize(job.city)}{job.province ? ` (${job.province})` : ''}</span>
                        </span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                            <Icon type="star" className="w-3.5 h-3.5 mr-1" />
                            {job.salaryMin && job.salaryMax 
                                ? `€${job.salaryMin} - €${job.salaryMax}`
                                : job.salaryMin 
                                    ? `Da €${job.salaryMin}`
                                    : `Fino a €${job.salaryMax}`
                            }
                        </span>
                    )}
                </div>
                
                <p className="text-xs text-slate-400 mt-4 font-medium flex items-center gap-1.5">
                    <Icon type="clock" className="w-3.5 h-3.5" />
                    Pubblicato {formatRelativeDate(job.$createdAt)}
                </p>
            </div>
            
            {/* Footer Azioni */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 rounded-b-2xl flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-auto">
                <button 
                    onClick={() => onSelectJob?.(job.$id)} 
                    className="w-full sm:w-auto text-center bg-white border-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                    Dettagli
                </button>
                <button 
                    onClick={() => onApply?.(job)} 
                    className="w-full sm:w-auto text-center bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm shadow-sm active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                >
                    <Icon type="send" className="w-4 h-4" />
                    Candidati Ora
                </button>
            </div>
        </div>
    );
};