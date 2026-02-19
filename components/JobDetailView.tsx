
import React from 'react';
import type { MockJob } from '../types';
import { Icon } from './Icon';
import { FACILITIES } from '../src/utils/mockData';

interface JobDetailViewProps {
  job: MockJob;
  onBack: () => void;
  onApply: (job: MockJob) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, onBack, onApply }) => {
    const facility = FACILITIES.find(f => f.id === job.facilityId);

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
        <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex justify-between items-start">
                <button onClick={onBack} className="flex items-center text-blue-600 hover:underline mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Indietro
                </button>
                 <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Icon type="share" className="w-5 h-5"/></button>
                    <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Icon type="heart" className="w-5 h-5"/></button>
                </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{job.title}</h1>
            <div className="flex items-center mt-2 space-x-2 text-slate-600">
                <img src={job.facilityLogo} alt={job.facilityName} className="w-8 h-8 rounded-md" />
                <span className="font-semibold">{job.facilityName}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 mt-4 text-sm">
                <span className="flex items-center"><Icon type="location" className="w-4 h-4 mr-2"/>{job.location}</span>
                <span className="flex items-center"><Icon type="clock" className="w-4 h-4 mr-2"/>{job.type}</span>
                {job.salary && <span className="flex items-center"><Icon type="star" className="w-4 h-4 mr-2"/>{job.salary}</span>}
            </div>
        </div>

        <div className="p-4 sm:p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Descrizione del Lavoro</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
        </div>
        
        <div className="p-4 sm:p-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Requisiti</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
                {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
        </div>
        
        {facility && (
            <div className="p-4 sm:p-6 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-3">Informazioni sulla Struttura</h2>
                <p className="text-slate-700 mb-4">{facility.about}</p>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {facility.images.map((img, i) => (
                        <img key={i} src={img} alt={`${facility.name} ${i+1}`} className="rounded-lg object-cover w-full h-24" />
                    ))}
                </div>
            </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 sticky bottom-16 md:bottom-0">
             <button onClick={() => onApply(job)} className="w-full text-center bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition">CANDIDATI ORA</button>
        </div>
    </div>
  );
};