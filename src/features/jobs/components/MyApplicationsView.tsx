import React, { useState } from 'react';
import type { Application, Job } from '@/types/types';
import { ApplicationCard } from './ApplicationCard';
import { Icon } from '@/components/ui/Icon';

export interface EnrichedApplication extends Application {
    job?: Job;
    facilityLogo?: string;
}

interface MyApplicationsViewProps {
    applications: EnrichedApplication[];
    onBack: () => void;
    onSelectJob: (id: string) => void;
    onWithdraw?: (applicationId: string) => void;
}

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Tutte' },
    { id: 'pending', label: 'In Corso / Revisione' },
    { id: 'accepted', label: 'Accettate' },
    { id: 'rejected', label: 'Rifiutate' },
];

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({ 
    applications, 
    onBack, 
    onSelectJob,
    onWithdraw 
}) => {
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

    const filteredApplications = applications.filter(app => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return app.status === 'pending' || app.status === 'reviewed';
        return app.status === activeFilter;
    });

    return (
        <div className="max-w-4xl mx-auto w-full pb-20 md:pb-8 animate-in fade-in duration-500">
            <button 
                onClick={onBack} 
                className="mb-6 text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-200 rounded px-1"
            >
                <Icon type="arrow-left" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                Torna ai lavori
            </button>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <Icon type="briefcase" className="w-8 h-8 text-blue-600" />
                Le mie candidature
            </h1>
            
            <div className="mb-6 border-b border-slate-200">
                <nav className="flex space-x-6 overflow-x-auto custom-scrollbar hide-scrollbar-mobile -mb-px">
                    {filters.map(filter => {
                        const count = applications.filter(app => {
                            if (filter.id === 'all') return true;
                            if (filter.id === 'pending') return app.status === 'pending' || app.status === 'reviewed';
                            return app.status === filter.id;
                        }).length;

                        const isActive = activeFilter === filter.id;

                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`whitespace-nowrap px-1 py-4 text-sm sm:text-base font-bold border-b-2 transition-all flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
                                    isActive 
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {filter.label} 
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                    {filteredApplications.map(app => (
                        <ApplicationCard 
                            key={app.$id} 
                            application={app} 
                            onSelectJob={onSelectJob} 
                            onWithdraw={onWithdraw}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon type="send" className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Nessuna candidatura trovata</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        {activeFilter === 'all' 
                            ? 'Non hai ancora inviato nessuna candidatura. Esplora la bacheca lavoro per trovare la tua prossima opportunità!' 
                            : 'Non ci sono candidature in questo stato.'}
                    </p>
                    {activeFilter === 'all' && (
                        <button 
                            onClick={onBack}
                            className="mt-6 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            Esplora Offerte
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};