import React, { useState, useEffect } from 'react';
import { JobCard } from './JobCard';
import { Icon } from './Icon';
import { CreateJobModal } from './CreateJobModal';
import { databaseService } from '../src/services/database';
import { useAuth } from '../src/hooks/useAuth';
import type { MockJob, Job } from '../types';

interface LavoroViewProps {
  onSelectJob: (id: string) => void;
  onApply: (job: Job | MockJob) => void;
  onShowMyApplications: () => void;
}

const FilterPill: React.FC<{ label: string; icon: string; active?: boolean; onClick?: () => void }> = ({ label, icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full border transition ${
            active 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
        }`}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

export const LavoroView: React.FC<LavoroViewProps> = ({ onSelectJob, onApply, onShowMyApplications }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tutti');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Controlla se l'utente è una struttura (può pubblicare annunci)
    const isStructure = user?.userType === 'structure';

    const filters = [
        { label: 'Tutti', icon: '🏊' },
        { label: 'Istruttore', icon: '👨‍🏫' },
        { label: 'Bagnino', icon: '🛡️' },
        { label: 'Tecnico', icon: '🔧' },
        { label: 'Vicino a me', icon: '📍' },
    ];

    // Carica i lavori dal database
    useEffect(() => {
        loadJobs();
    }, [activeFilter]);

    const loadJobs = async () => {
        setIsLoading(true);
        try {
            const roleFilter = activeFilter !== 'Tutti' && activeFilter !== 'Vicino a me' 
                ? activeFilter.toLowerCase() 
                : undefined;
            
            const fetchedJobs = await databaseService.getJobsWithStructures({
                role: roleFilter,
                isActive: true
            });
            
            setJobs(fetchedJobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtra per ricerca
    const filteredJobs = jobs.filter(job => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            job.title?.toLowerCase().includes(query) ||
            job.city?.toLowerCase().includes(query) ||
            job.structure?.structureName?.toLowerCase().includes(query) ||
            job.role?.toLowerCase().includes(query)
        );
    });

    const handleJobCreated = () => {
        setIsCreateModalOpen(false);
        loadJobs(); // Ricarica la lista
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Trova il tuo prossimo lavoro</h1>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    {/* Bottone pubblica annuncio - solo per strutture */}
                    {isStructure && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
                        >
                            <Icon type="plus" className="w-4 h-4" />
                            Pubblica Annuncio
                        </button>
                    )}
                    <button 
                        onClick={onShowMyApplications}
                        className="flex-shrink-0 text-sm font-semibold text-blue-600 hover:underline"
                    >
                        Le mie candidature &rarr;
                    </button>
                </div>
            </div>
            
            {/* Filtri */}
            <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
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
            <div className="relative mb-6">
                <input 
                    type="text"
                    placeholder="Cerca per ruolo, città, struttura..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon type="search" className="h-6 w-6 text-gray-400" />
                </div>
            </div>

            {/* Lista lavori */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard 
                            key={job.$id} 
                            job={job} 
                            structure={job.structure}
                            onSelectJob={() => onSelectJob(job.$id)} 
                            onApply={() => onApply(job)} 
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <Icon type="briefcase" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600 mb-2">Nessun lavoro trovato</h3>
                        <p className="text-slate-500">
                            {searchQuery 
                                ? 'Prova a modificare i criteri di ricerca' 
                                : 'Non ci sono annunci di lavoro al momento'}
                        </p>
                        {isStructure && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
                            >
                                Pubblica il primo annuncio
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal per creare annuncio */}
            {isStructure && (
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