
import React from 'react';
import type { MockApplication } from '../types';
import { Icon } from './Icon';
import { JOBS } from '../src/utils/mockData';

interface ApplicationCardProps {
    application: MockApplication;
    onSelectJob: (id: number) => void;
}

const statusStyles = {
    'inviata': { text: 'Inviata', icon: 'send', color: 'text-slate-500', bgColor: 'bg-slate-100' },
    'in revisione': { text: 'In Revisione', icon: 'search', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'accettata': { text: 'Accettata', icon: 'certificate', color: 'text-green-600', bgColor: 'bg-green-100' },
    'rifiutata': { text: 'Rifiutata', icon: 'x', color: 'text-red-600', bgColor: 'bg-red-100' },
};


export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onSelectJob }) => {
    const job = JOBS.find(j => j.id === application.jobId);
    if (!job) return null;

    const statusInfo = statusStyles[application.status];

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <img src={job.facilityLogo} alt={job.facilityName} className="w-12 h-12 rounded-lg object-cover"/>
                        <div>
                             <h3 className="font-bold text-lg text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => onSelectJob(job.id)}>{job.title}</h3>
                            <p className="text-md text-slate-600">{job.facilityName}</p>
                            <p className="text-sm text-slate-500">{job.location}</p>
                        </div>
                    </div>
                     <div className={`flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <Icon type={statusInfo.icon as any} className="w-4 h-4" />
                        <span>{statusInfo.text}</span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex justify-between items-center text-sm">
                <p className="text-slate-500">Inviata {application.submittedOn} (Mod. {application.type})</p>
                <div className="flex items-center space-x-3">
                    <button className="font-semibold text-slate-600 hover:underline">Ritira</button>
                    <button onClick={() => onSelectJob(job.id)} className="font-semibold text-blue-600 hover:underline">Vedi offerta</button>
                </div>
            </div>
        </div>
    );
};