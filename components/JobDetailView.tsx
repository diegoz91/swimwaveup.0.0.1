import React, { useMemo } from 'react';
import type { Job, StructureProfile } from '../types';
import { Icon } from './Icon';

interface JobDetailViewProps {
  job: Job;
  structure?: StructureProfile | null;
  onBack: () => void;
  onApply: (job: Job) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, structure, onBack, onApply }) => {
  
    const { structureName, structureLogo } = useMemo(() => {
        const name = structure?.structureName || job.structureName || 'Struttura Non Specificata';
        const logo = structure?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;
        return { structureName: name, structureLogo: logo };
    }, [structure, job.structureName]);

    const renderSalary = () => {
        if (!job.salaryMin && !job.salaryMax) return null;
        if (job.salaryMin && job.salaryMax) return `€${job.salaryMin} - €${job.salaryMax} / mese`;
        if (job.salaryMin) return `Da €${job.salaryMin} / mese`;
        return `Fino a €${job.salaryMax} / mese`;
    };

    const salaryString = renderSalary();

    return (
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto overflow-hidden relative pb-24 md:pb-0 border border-slate-100">
            
            {/* Header / Meta */}
            <div className="p-5 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-6">
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-slate-500 hover:text-blue-600 font-semibold group transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg pr-2"
                        aria-label="Torna indietro"
                    >
                        <Icon type="x" className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Indietro
                    </button>
                    <div className="flex space-x-3">
                        <button className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm" title="Condividi">
                            <Icon type="share" className="w-5 h-5"/>
                        </button>
                        <button className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm" title="Salva offerta">
                            <Icon type="heart" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
                    {job.title}
                </h1>
                
                <div className="flex items-center mt-5 space-x-3 text-slate-700">
                    <img 
                        src={structureLogo} 
                        alt={`Logo ${structureName}`} 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 shadow-sm bg-white" 
                    />
                    <span className="font-bold text-lg">{structureName}</span>
                </div>
                
                {/* Info Pills */}
                <div className="flex flex-wrap gap-3 mt-6 text-sm font-semibold">
                    <span className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-sm">
                        <Icon type="location" className="w-4 h-4 mr-1.5 text-slate-400"/>
                        {job.city}{job.province ? ` (${job.province})` : ''}
                    </span>
                    <span className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-sm">
                        <Icon type="briefcase" className="w-4 h-4 mr-1.5 text-slate-400"/>
                        {job.contractType || 'Contratto non specificato'}
                    </span>
                    {job.workingHours && (
                        <span className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-sm">
                            <Icon type="clock" className="w-4 h-4 mr-1.5 text-slate-400"/>
                            {job.workingHours}
                        </span>
                    )}
                    {salaryString && (
                        <span className="flex items-center bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-green-700 shadow-sm">
                            <Icon type="star" className="w-4 h-4 mr-1.5 text-green-600"/>
                            {salaryString}
                        </span>
                    )}
                </div>
            </div>

            {/* Descrizione */}
            <div className="p-5 sm:p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Icon type="info" className="w-5 h-5 text-blue-600" />
                    Descrizione del Lavoro
                </h2>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {job.description}
                </div>
            </div>
            
            {/* Requisiti e Qualifiche (Divisi in griglia se presenti entrambi) */}
            <div className={`p-5 sm:p-8 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 ${job.qualificationsRequired && job.qualificationsRequired.length > 0 ? 'md:grid-cols-2 gap-8' : ''}`}>
                {job.requirements && job.requirements.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Icon type="check-double" className="w-5 h-5 text-green-600" />
                            Requisiti
                        </h2>
                        <ul className="space-y-3">
                            {job.requirements.map((req, i) => (
                                <li key={i} className="flex items-start text-slate-700 text-[15px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3 flex-shrink-0"></div>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {job.qualificationsRequired && job.qualificationsRequired.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Icon type="certificate" className="w-5 h-5 text-amber-500" />
                            Brevetti Richiesti
                        </h2>
                        <ul className="space-y-3">
                            {job.qualificationsRequired.map((qual, i) => (
                                <li key={i} className="flex items-start text-slate-700 text-[15px]">
                                    <Icon type="star" className="w-4 h-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                                    <span className="font-medium">{qual}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            {/* Info Struttura */}
            {structure && (
                <div className="p-5 sm:p-8 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Icon type="building" className="w-5 h-5 text-blue-600" />
                        L'azienda
                    </h2>
                    <p className="text-slate-700 mb-6 leading-relaxed text-[15px]">
                        {structure.bio || 'La struttura non ha inserito una descrizione aziendale.'}
                    </p>
                    
                    {/* Placeholder per immagini struttura per salvataggio futuro su DB */}
                    {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <img src="https://picsum.photos/seed/1/400/300" alt="Struttura 1" className="rounded-xl object-cover w-full h-32 border border-slate-200 shadow-sm" />
                        <img src="https://picsum.photos/seed/2/400/300" alt="Struttura 2" className="rounded-xl object-cover w-full h-32 border border-slate-200 shadow-sm" />
                    </div> 
                    */}
                </div>
            )}

            {/* Floating Action Button (Mobile e Desktop) */}
            <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 md:border-none md:bg-slate-50 md:p-6 z-20" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <button 
                    onClick={() => onApply(job)} 
                    className="w-full text-center bg-blue-600 text-white font-extrabold text-lg py-3.5 px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                    <Icon type="send" className="w-5 h-5" />
                    CANDIDATI ORA
                </button>
            </div>
            
        </div>
    );
};