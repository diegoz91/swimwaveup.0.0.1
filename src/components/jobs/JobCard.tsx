// src/components/jobs/JobCard.tsx
import React, { useState, useMemo } from 'react';
import { databaseService } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHandler } from '../../utils/errorHandler';
import type { Job } from '../../../types';
import { Icon } from '../../../components/Icon';

interface JobCardProps {
    job: Job;
    onApplicationSent?: (jobId: string) => void;
    onViewDetails?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApplicationSent, onViewDetails }) => {
    const [applying, setApplying] = useState(false);
    const { user } = useAuth();
    const { logJobApplicationError } = useErrorHandler();

    const structureName = job.structureName || 'Struttura Non Specificata';
    const displayLogo = job.facilityLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(structureName)}&background=eff6ff&color=1d4ed8`;

    const handleQuickApply = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert("Devi effettuare l'accesso per candidarti.");
            return;
        }
        
        setApplying(true);
        try {
            console.log('🚀 Invio candidatura rapida per:', job.$id);
            
            const applicationData = {
                jobId: job.$id,
                applicantId: user.$id,
                coverLetter: `Salve, sono molto interessato/a alla posizione di ${job.title}. Ritengo che le mie qualifiche ed esperienze siano perfettamente in linea con i requisiti richiesti. Resto in attesa di un vostro riscontro.`,
                status: 'pending' as const
            };

            await databaseService.createApplication(applicationData);
            
            alert('Candidatura inviata con successo! In bocca al lupo 🍀');
            if (onApplicationSent) onApplicationSent(job.$id);
            
        } catch (error) {
            logJobApplicationError(error as Error, job.$id);
            alert("Errore durante l'invio della candidatura. Riprova più tardi.");
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (min?: number, max?: number) => {
        if (!min && !max) return 'Da concordare';
        if (min && max) return `€${min} - €${max}`;
        if (min) return `Da €${min}`;
        return `Fino a €${max}`;
    };
    
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return 'Data sconosciuta';
        }
    };

    return (
        <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
            onClick={() => onViewDetails && onViewDetails(job.$id)}
            role="button"
            tabIndex={0}
            aria-label={`Visualizza dettagli per ${job.title}`}
        >
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 min-w-0">
                        <img 
                            src={displayLogo} 
                            alt={`Logo ${structureName}`} 
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0 bg-slate-50"
                            loading="lazy"
                        />
                        <div className="min-w-0">
                            <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight mb-1">
                                {job.title}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 truncate">
                                {structureName} <span className="mx-1">•</span> {job.city || 'Non specificata'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Badges / Dettagli */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 mb-4">
                    <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md">
                        <Icon type="clock" className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {job.contractType || 'Full-time'}
                    </span>
                    {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
                            <Icon type="star" className="w-3.5 h-3.5 mr-1" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                    )}
                    <span className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md text-slate-500 border border-slate-100">
                        <Icon type="calendar" className="w-3.5 h-3.5 mr-1" />
                        {formatDate(job.$createdAt)}
                    </span>
                </div>
                
                {/* Descrizione troncata */}
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-2 flex-1">
                    {job.description}
                </p>
            </div>
            
            {/* Azioni */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails && onViewDetails(job.$id);
                    }}
                    className="w-full sm:w-1/2 bg-white border-2 border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                    Dettagli
                </button>
                <button 
                    onClick={handleQuickApply} 
                    disabled={applying} 
                    className="w-full sm:w-1/2 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 active:scale-95"
                >
                    {applying ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Invio...
                        </>
                    ) : (
                        <>
                            <Icon type="sparkles" className="w-4 h-4" />
                            Candidatura Rapida
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default JobCard;