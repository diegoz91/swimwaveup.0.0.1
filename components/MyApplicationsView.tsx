
import React, { useState } from 'react';
import type { MockApplication } from '../types';
import { ApplicationCard } from './ApplicationCard';
import { Icon } from './Icon';

interface MyApplicationsViewProps {
  applications: MockApplication[];
  onBack: () => void;
  onSelectJob: (id: number) => void;
}

type StatusFilter = 'tutte' | 'in corso' | 'accettata' | 'rifiutata';

const filters: { id: StatusFilter; label: string }[] = [
    { id: 'tutte', label: 'Tutte' },
    { id: 'in corso', label: 'In Corso' },
    { id: 'accettata', label: 'Accettate' },
    { id: 'rifiutata', label: 'Rifiutate' },
];

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({ applications, onBack, onSelectJob }) => {
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('tutte');

    const filteredApplications = applications.filter(app => {
        if (activeFilter === 'tutte') return true;
        if (activeFilter === 'in corso') return app.status === 'inviata' || app.status === 'in revisione';
        return app.status === activeFilter;
    });

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Indietro</button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Le mie candidature</h1>
            
            <div className="mb-6 border-b border-slate-200">
                <nav className="flex space-x-4 sm:space-x-6 -mb-px">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-1 py-3 text-sm sm:text-base font-semibold border-b-2 transition-colors ${
                                activeFilter === filter.id 
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {filter.label} ({applications.filter(app => {
                                if (filter.id === 'tutte') return true;
                                if (filter.id === 'in corso') return app.status === 'inviata' || app.status === 'in revisione';
                                return app.status === filter.id;
                            }).length})
                        </button>
                    ))}
                </nav>
            </div>

            {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                    {filteredApplications.map(app => (
                        <ApplicationCard key={app.id} application={app} onSelectJob={onSelectJob} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
                    <Icon type="briefcase" className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">Nessuna candidatura trovata</h3>
                    <p className="text-slate-500 mt-1">Non hai candidature che corrispondono a questo stato.</p>
                </div>
            )}
        </div>
    );
};
