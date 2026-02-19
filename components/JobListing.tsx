
import React from 'react';
import type { MockJob } from '../types';
import { Icon } from './Icon';

interface JobListingProps {
  job: MockJob;
  onSelectJob: () => void;
  view?: 'dashboard' | 'lavoro';
}

export const JobListing: React.FC<JobListingProps> = ({ job, onSelectJob, view = 'lavoro' }) => {
  if (view === 'dashboard') {
    return (
       <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-500 cursor-pointer" onClick={onSelectJob}>
            <div className="p-4">
                 <p className="text-xs font-semibold text-purple-600 mb-2 uppercase">Opportunità di Lavoro</p>
                <div className="flex items-start space-x-4">
                    <img src={job.facilityLogo} alt={job.facilityName} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                        <h3 className="text-md font-bold text-slate-800">{job.title}</h3>
                        <p className="text-slate-600 text-sm">{job.facilityName}</p>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Icon type="location" className="w-4 h-4 mr-1" />
                            <span>{job.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Default view for sidebars
  return (
    <div className="flex items-start space-x-3 cursor-pointer group" onClick={onSelectJob}>
      <img src={job.facilityLogo} alt={job.facilityName} className="w-12 h-12 rounded-md object-cover mt-1" />
      <div>
        <p className="font-bold text-slate-700 group-hover:text-blue-600 transition">{job.title}</p>
        <p className="text-sm text-slate-600">{job.facilityName}</p>
        <div className="flex items-center text-xs text-slate-500 mt-1">
          <Icon type="location" className="w-4 h-4 mr-1" />
          <span>{job.location}</span>
        </div>
      </div>
    </div>
  );
};
