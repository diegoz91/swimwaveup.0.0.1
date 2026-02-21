import React from 'react';
import type { StructureProfile, Job } from '../types';
import { Icon } from './Icon';

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
    
    const displayLogo = facility.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(facility.structureName)}&background=f1f5f9&color=1d4ed8`;
    
    const getCoverImage = (index: number) => {
        // const images = facility.coverImages || [];
        // if (images[index]) return images[index];
        
        return `https://picsum.photos/seed/${facility.$id}${index}/800/400`;
    };

    return (
        <div className="max-w-5xl mx-auto w-full pb-8">
            <button 
                onClick={onBack} 
                className="mb-4 text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-all"
            >
                <Icon type="x" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                Indietro
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                
                {/* Header Immagini */}
                <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-100">
                    <div className="md:col-span-2 h-48 md:h-72">
                        <img 
                            src={getCoverImage(0)} 
                            alt={`Copertina di ${facility.structureName}`} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                        />
                    </div>
                    <div className="hidden md:grid grid-rows-2 h-72">
                        <img src={getCoverImage(1)} alt="Immagine impianto 1" className="w-full h-36 object-cover border-b-4 border-l-4 border-white" loading="lazy" />
                        <img src={getCoverImage(2)} alt="Immagine impianto 2" className="w-full h-36 object-cover border-l-4 border-white" loading="lazy" />
                    </div>
                </div>

                {/* Profilo Top Section */}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex items-end sm:items-center -mt-16 sm:-mt-20 flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                            <img 
                                src={displayLogo} 
                                alt={facility.structureName} 
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white object-cover shadow-lg bg-white self-start sm:self-auto" 
                            />
                            <div className="flex-1 w-full pt-2 sm:pt-16">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 line-clamp-2">
                                    {facility.structureName}
                                </h1>
                                <p className="text-slate-600 font-medium mt-1 flex items-center gap-1">
                                    <Icon type="home" className="w-4 h-4" /> 
                                    {facility.structureType || 'Centro Acquatico'}
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                                    <Icon type="location" className="w-4 h-4" />
                                    {facility.city}, {facility.province}
                                </p>
                            </div>
                            
                            <div className="mt-4 sm:mt-16 sm:self-end self-stretch">
                                <button className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                    <Icon type="plus" className="w-4 h-4" /> Segui
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sezione Info */}
                <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Icon type="info" className="w-5 h-5 text-blue-500" />
                        Chi Siamo
                    </h2>
                    {facility.bio ? (
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{facility.bio}</p>
                    ) : (
                        <p className="text-slate-400 italic">Nessuna descrizione fornita dalla struttura.</p>
                    )}
                </div>

                {/* Griglia Servizi e Caratteristiche */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t border-slate-100">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Icon type="star" className="w-5 h-5 text-amber-500" />
                            Servizi Offerti
                        </h2>
                        {facility.servicesList && facility.servicesList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {facility.servicesList.map((service, index) => (
                                    <div key={index} className="flex items-center text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                                        <span className="text-sm font-medium">{service}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic">Nessun servizio specificato.</p>
                        )}
                    </div>
                    
                    <div className="p-6 sm:p-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Icon type="certificate" className="w-5 h-5 text-green-500" />
                            Caratteristiche
                        </h2>
                        {facility.featuresList && facility.featuresList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {facility.featuresList.map((feature, index) => (
                                    <div key={index} className="flex items-center text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <Icon type="check-double" className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic">Nessuna caratteristica specificata.</p>
                        )}
                    </div>
                </div>
                
                {/* Sezione Posizioni Aperte */}
                <div className="p-6 sm:p-8 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <Icon type="briefcase" className="w-6 h-6 text-blue-600" />
                        Posizioni Aperte
                        {openJobs.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-sm py-0.5 px-2.5 rounded-full">
                                {openJobs.length}
                            </span>
                        )}
                    </h2>
                    
                    {openJobs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {openJobs.map(job => (
                                <div key={job.$id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center text-sm text-slate-500 mt-1.5 gap-x-4 gap-y-1">
                                                <span className="flex items-center bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-600">
                                                    {job.role.toUpperCase()}
                                                </span>
                                                <span className="flex items-center">
                                                    <Icon type="location" className="w-4 h-4 mr-1 opacity-70"/>
                                                    {job.city}
                                                </span>
                                                <span className="flex items-center">
                                                    <Icon type="briefcase" className="w-4 h-4 mr-1 opacity-70"/>
                                                    {job.contractType}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onSelectJob && onSelectJob(job.$id)} 
                                            className="w-full sm:w-auto bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                        >
                                            Vedi dettagli
                                        </button>
                                    </div>
                                    <p className="text-slate-600 mt-3 text-sm line-clamp-2">
                                        {job.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
                            <Icon type="search" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">Al momento non ci sono posizioni aperte.</p>
                            <p className="text-sm text-slate-400 mt-1">Torna a visitare questa pagina in futuro!</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};