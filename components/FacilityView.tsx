
import React from 'react';
import type { AquaticFacility, ProfessionalUser } from '../types';
import { Icon } from './Icon';

interface FacilityViewProps {
  facility: AquaticFacility;
  onBack: () => void;
  onSelectProfile: (id: number) => void;
}

export const FacilityView: React.FC<FacilityViewProps> = ({ facility, onBack, onSelectProfile }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Indietro</button>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <img src={facility.images[0]} alt={facility.name} className="w-full h-64 object-cover" />
          </div>
          <div className="hidden md:grid grid-rows-2">
            <img src={facility.images[1]} alt={facility.name} className="w-full h-32 object-cover" />
            <img src={facility.images[2]} alt={facility.name} className="w-full h-32 object-cover" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div className="flex items-center">
              <img src={facility.logoUrl} alt={facility.name} className="w-20 h-20 rounded-md border-2 border-white object-cover -mt-16 mr-4 shadow-lg" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{facility.name}</h1>
                <p className="text-slate-600">{facility.type}</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">Segui</button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Chi Siamo</h2>
          <p className="text-slate-700">{facility.about}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Servizi Offerti</h2>
                <div className="space-y-2">
                    {facility.services.map(service => (
                    <div key={service} className="flex items-center text-slate-700">
                        <Icon type="star" className="w-5 h-5 mr-3 text-blue-500" />
                        <span>{service}</span>
                    </div>
                    ))}
                </div>
            </div>
            <div className="p-6 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Caratteristiche Struttura</h2>
                 <div className="space-y-2">
                    {facility.features.map(feature => (
                    <div key={feature} className="flex items-center text-slate-700">
                        <Icon type="certificate" className="w-5 h-5 mr-3 text-green-500" />
                        <span>{feature}</span>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="p-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Posizioni Aperte</h2>
            {facility.openPositions.length > 0 ? (
                <div className="space-y-4">
                    {facility.openPositions.map(job => (
                        <div key={job.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-bold text-slate-800">{job.title}</h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                               <span className="flex items-center"><Icon type="location" className="w-4 h-4 mr-1"/>{job.location}</span>
                               <span className="flex items-center"><Icon type="briefcase" className="w-4 h-4 mr-1"/>{job.type}</span>
                            </div>
                            <p className="text-slate-600 mt-2 text-sm">{job.description}</p>
                            <button className="mt-3 bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition">Vedi dettagli e candidati</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-600">Al momento non ci sono posizioni aperte.</p>
            )}
        </div>

      </div>
    </div>
  );
};
