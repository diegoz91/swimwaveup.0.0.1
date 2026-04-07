import React from 'react';
import type { StructureProfile, Job } from '@/types/types';
import { Icon } from '@/components/ui/Icon';

interface FacilityViewProps {
    facility: StructureProfile;
    openJobs?: Job[]; 
    onBack: () => void;
    onSelectJob?: (jobId: string) => void;
}

export const FacilityView: React.FC<FacilityViewProps> = ({ 
    facility, 
    openJobs = [], 
    onBack, 
    onSelectJob 
}) => {
    const structureName = facility.structureName || 'Struttura Non Specificata';
    const displayLogo = facility.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(structureName)}&background=f1f5f9&color=1d4ed8`;
    
    const getCoverImage = (index: number) => {
        return `https://picsum.photos/seed/${facility.$id || 'fac'}${index}/800/400`;
    };

    return (
        <div className="max-w-5xl mx-auto w-full pb-8 animate-in fade-in duration-500">
            <button 
                onClick={onBack} 
                className="mb-4 text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
            >
                <Icon type="arrow-left" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                Torna indietro
            </button>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="h-48 sm:h-64 bg-slate-800 relative">
                    <img 
                        src={getCoverImage(1)} 
                        alt="Struttura" 
                        className="w-full h-full object-cover opacity-60" 
                        loading="lazy"
                    />
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
                        <img 
                            src={displayLogo} 
                            alt={structureName} 
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white" 
                        />
                        <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full hover:bg-blue-700 transition shadow-sm active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                            Contatta
                        </button>
                    </div>
                    
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{structureName}</h1>
                        <p className="text-lg text-slate-600 font-medium mt-1">{facility.structureType || 'Centro Sportivo'}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Icon type="location" className="w-4 h-4 text-slate-400" />
                                {facility.city}{facility.province ? ` (${facility.province})` : ''}
                            </span>
                            <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-700">
                                <Icon type="users" className="w-4 h-4" />
                                {facility.connections?.length || 0} Collegamenti
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Icon type="info" className="w-5 h-5 text-blue-600" />
                            Chi siamo
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {facility.bio || 'La struttura non ha ancora inserito una descrizione.'}
                        </p>
                    </div>
                </div>

                {/* Lavori */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                        <Icon type="briefcase" className="w-6 h-6 text-blue-600" />
                        Posizioni Aperte ({openJobs.length})
                    </h2>
                    
                    {openJobs.length > 0 ? (
                        <div className="space-y-4">
                            {openJobs.map(job => (
                                <div key={job.$id} className="bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Icon type="user" className="w-3.5 h-3.5" /> {job.role}</span>
                                                <span className="flex items-center gap-1"><Icon type="clock" className="w-3.5 h-3.5" /> {job.contractType}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onSelectJob && onSelectJob(job.$id)} 
                                            className="w-full sm:w-auto bg-blue-50 text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            Vedi dettagli
                                        </button>
                                    </div>
                                    {job.description && (
                                        <p className="text-slate-600 mt-3 text-sm line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                            <Icon type="search" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-bold text-lg">Nessuna posizione aperta</p>
                            <p className="text-sm text-slate-500 mt-1">Torna a visitare questa pagina in futuro!</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};