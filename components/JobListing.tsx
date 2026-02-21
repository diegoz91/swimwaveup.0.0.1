import React from 'react';
import type { Job } from '../types';
import { Icon } from './Icon';

interface JobListingProps {
  job: Job & { facilityLogo?: string }; 
  onSelectJob: () => void;
  view?: 'dashboard' | 'lavoro';
}

export const JobListing: React.FC<JobListingProps> = ({ 
  job, 
  onSelectJob, 
  view = 'lavoro' 
}) => {
  const structureName = job.structureName || 'Struttura Non Specificata';
  const locationString = job.city ? `${job.city}${job.province ? ` (${job.province})` : ''}` : 'Sede non specificata';
  const displayLogo = job.facilityLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(structureName)}&background=f8fafc&color=3b82f6`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectJob();
    }
  };

  // --- VISTA DASHBOARD ---
  if (view === 'dashboard') {
    return (
       <div 
          className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
          onClick={onSelectJob}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`Visualizza offerta di lavoro: ${job.title}`}
        >
            {/* Bordo laterale in stile "Sponsorizzato" */}
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            
            <div className="p-4 sm:p-5">
                 <p className="text-[10px] font-bold text-indigo-600 mb-2.5 uppercase tracking-wider flex items-center gap-1">
                    <Icon type="sparkles" className="w-3.5 h-3.5" />
                    Opportunità in Evidenza
                 </p>
                <div className="flex items-start gap-4">
                    <img 
                        src={displayLogo} 
                        alt={`Logo ${structureName}`} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0 bg-slate-50" 
                        loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-slate-600 text-sm truncate mt-0.5">{structureName}</p>
                        <div className="flex flex-wrap items-center text-xs text-slate-500 mt-1.5 gap-3">
                            <span className="flex items-center">
                                <Icon type="location" className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                <span className="truncate max-w-[120px]">{locationString}</span>
                            </span>
                            {job.contractType && (
                                <span className="flex items-center">
                                    <Icon type="briefcase" className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    <span>{job.contractType}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- VISTA LAVORO ---
  return (
    <div 
        className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200" 
        onClick={onSelectJob}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`Visualizza offerta: ${job.title}`}
    >
      <img 
        src={displayLogo} 
        alt={`Logo ${structureName}`} 
        className="w-10 h-10 rounded-lg object-cover mt-0.5 border border-slate-100 flex-shrink-0 bg-white" 
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
            {job.title}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{structureName}</p>
        <div className="flex items-center text-[11px] font-medium text-slate-400 mt-1">
          <Icon type="location" className="w-3 h-3 mr-1 opacity-70" />
          <span className="truncate">{locationString}</span>
        </div>
      </div>
    </div>
  );
};