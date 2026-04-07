import React, { useState, useEffect, useMemo } from 'react';
import { JobCard } from './JobCard';
import { Icon } from '@/components/ui/Icon';
import { CreateJobModal } from './CreateJobModal';
import { databaseService } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import type { Job } from '@/types/types';

interface LavoroViewProps {
  onSelectJob: (id: string) => void;
  onApply: (job: Job) => void;
  onShowMyApplications: () => void;
}

const FilterPill: React.FC<{ label: string; icon: string; active?: boolean; onClick?: () => void }> = ({ label, icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full border transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 ${
            active 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
        }`}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

export const LavoroView: React.FC<LavoroViewProps> = ({ onSelectJob, onApply, onShowMyApplications }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tutti');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isStructure = user?.userType === 'structure';

    const filters = [
        { label: 'Tutti', icon: '🏊' },
        { label: 'Istruttore', icon: '👨‍🏫' },
        { label: 'Bagnino', icon: '🛡️' },
        { label: 'Tecnico', icon: '🔧' },
        { label: 'Coordinatore', icon: '📋' },
    ];

    const loadJobs = async () => {
        setIsLoading(true);
        try {
            const fetchedJobs = await databaseService.getActiveJobs();
            
            const filtered = activeFilter !== 'Tutti' 
                ? fetchedJobs.filter(j => j.role?.toLowerCase() === activeFilter.toLowerCase())
                : fetchedJobs;
                
            setJobs(filtered);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [activeFilter]);

    const filteredJobs = useMemo(() => {
        if (!searchQuery.trim()) return jobs;
        const query = searchQuery.toLowerCase().trim();
        
        return jobs.filter(job => {
            const titleMatch = job.title?.toLowerCase().includes(query) ?? false;
            const cityMatch = job.city?.toLowerCase().includes(query) ?? false;
            const roleMatch = job.role?.toLowerCase().includes(query) ?? false;
            const structureMatch = job.structureName?.toLowerCase().includes(query) ?? false;
            
            return titleMatch || cityMatch || roleMatch || structureMatch;
        });
    }, [jobs, searchQuery]);

    const handleJobCreated = () => {
        setIsCreateModalOpen(false);
        loadJobs();
    };

    return (
        <div className="max-w-4xl mx-auto w-full pb-20 md:pb-8 animate-in fade-in duration-500">
            {/* Header Lavoro */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Bacheca Lavoro</h1>
                    <p className="text-slate-500 text-sm mt-1">Trova le migliori opportunità nel mondo natatorio.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={onShowMyApplications}
                        className="flex-shrink-0 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        Le mie candidature
                    </button>
                    {isStructure && user && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <Icon type="plus" className="w-4 h-4" />
                            Pubblica Annuncio
                        </button>
                    )}
                </div>
            </div>
            
            {/* Filtri */}
            <div className="mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar-mobile">
                    {filters.map(f => (
                        <FilterPill 
                            key={f.label} 
                            {...f} 
                            active={activeFilter === f.label}
                            onClick={() => setActiveFilter(f.label)}
                        />
                    ))}
                </div>
            </div>

            {/* Barra di ricerca */}
            <div className="relative mb-8 group">
                <input 
                    type="text"
                    placeholder="Cerca per ruolo, città o struttura..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Icon type="search" className="h-5 w-5" />
                </div>
            </div>

            {/* Lista lavori */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-slate-500 font-medium mt-4">Caricamento annunci...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredJobs.map(job => (
                            <JobCard 
                                key={job.$id} 
                                job={job} 
                                onSelectJob={() => onSelectJob(job.$id)} 
                                onApply={() => onApply(job)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon type="briefcase" className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nessun lavoro trovato</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {searchQuery 
                                ? `Non ci sono risultati per "${searchQuery}". Prova a usare termini diversi o rimuovi i filtri.` 
                                : 'Non ci sono annunci attivi in questa categoria al momento.'}
                        </p>
                        {searchQuery && (
                            <button 
                                onClick={() => { setSearchQuery(''); setActiveFilter('Tutti'); }}
                                className="mt-6 font-semibold text-blue-600 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-blue-200 rounded"
                            >
                                Azzera ricerca
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal per creare annuncio */}
            {isStructure && user && (
                <CreateJobModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onJobCreated={handleJobCreated}
                    structureId={user.$id}
                />
            )}
        </div>
    );
};