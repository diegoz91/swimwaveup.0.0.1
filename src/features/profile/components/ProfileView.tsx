import React, { useState } from 'react';
import type { UserProfile, Experience, Certification } from '@/types/types';
import { Icon } from '@/components/ui/Icon';
import { ExperienceModal } from './ExperienceModal';
import { CertificationModal } from './CertificationModal';
import { databaseService } from '@/services/database';

interface ProfileViewProps {
  user: UserProfile;
  onBack: () => void;
  onContact: (userId: string) => void;
  isOwnProfile?: boolean;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  onBack, 
  onContact, 
  isOwnProfile = false,
  onUpdateProfile 
}) => {
    
    const [experienceModal, setExperienceModal] = useState<{isOpen: boolean, mode: 'add'|'edit', experience?: Experience, index?: number}>({ isOpen: false, mode: 'add' });
    const [certificationModal, setCertificationModal] = useState<{isOpen: boolean, mode: 'add'|'edit', certification?: Certification, index?: number}>({ isOpen: false, mode: 'add' });

    const safeParse = <T,>(data: any): T[] => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => {
            try { return typeof item === 'string' ? JSON.parse(item) : item; } 
            catch { return null; }
        }).filter(Boolean);
    };

    const experiences = safeParse<Experience>(user.experienceList);
    const certifications = safeParse<Certification>(user.certificationsList);

    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utente';
    const displayAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=1d4ed8&size=256`;
    
    const coverImage = "https://images.unsplash.com/photo-1519315901367-f34f9b571027?q=80&w=1920&auto=format&fit=crop";

    const getCertStyles = (cert: Certification) => {
        const str = `${cert.name} ${cert.issuer} ${cert.category}`.toLowerCase();
        if (str.includes('fin') || str.includes('federazione')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' };
        if (str.includes('salvamento') || str.includes('bagnanti') || str.includes('sns')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' };
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' };
    };

    const handleSaveExperience = async (exp: Experience) => {
        const newList = [...experiences];
        if (experienceModal.mode === 'edit' && experienceModal.index !== undefined) {
            newList[experienceModal.index] = exp;
        } else {
            newList.push(exp);
        }
        const updatedProfile = await databaseService.updateProfile(user.userId || user.$id, { experienceList: newList.map(e => JSON.stringify(e)) });
        if (onUpdateProfile) onUpdateProfile(updatedProfile as UserProfile);
    };

    const handleDeleteExperience = async (index: number) => {
        const newList = experiences.filter((_, i) => i !== index);
        const updatedProfile = await databaseService.updateProfile(user.userId || user.$id, { experienceList: newList.map(e => JSON.stringify(e)) });
        if (onUpdateProfile) onUpdateProfile(updatedProfile as UserProfile);
    };

    const handleSaveCertification = async (cert: Certification) => {
        const newList = [...certifications];
        if (certificationModal.mode === 'edit' && certificationModal.index !== undefined) {
            newList[certificationModal.index] = cert;
        } else {
            newList.push(cert);
        }
        const updatedProfile = await databaseService.updateProfile(user.userId || user.$id, { certificationsList: newList.map(e => JSON.stringify(e)) });
        if (onUpdateProfile) onUpdateProfile(updatedProfile as UserProfile);
    };

    const handleDeleteCertification = async (index: number) => {
        const newList = certifications.filter((_, i) => i !== index);
        const updatedProfile = await databaseService.updateProfile(user.userId || user.$id, { certificationsList: newList.map(e => JSON.stringify(e)) });
        if (onUpdateProfile) onUpdateProfile(updatedProfile as UserProfile);
    };

    return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      <button 
          onClick={onBack} 
          className="mb-6 text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
      >
          <Icon type="arrow-left" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Torna indietro
      </button>

      {/* 1. CARD INTESTAZIONE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative mb-6">
        <div className="h-32 sm:h-48 relative bg-blue-900">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 sm:-mt-20 mb-4 sm:mb-0 gap-4">
              <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-md bg-white relative z-10" 
              />
              {!isOwnProfile && (
                  <button 
                      onClick={() => onContact(user.userId || user.$id)} 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-sm active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                      <Icon type="chat-bubble" className="w-4 h-4" /> Contatta
                  </button>
              )}
          </div>

          <div className="mt-4 sm:mt-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{displayName}</h1>
              <p className="text-lg text-slate-700 font-semibold mb-3">{user.title || 'Ruolo non specificato'}</p>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Icon type="location" className="w-4 h-4" /> {user.city ? `${user.city} (${user.province})` : 'Località mancante'}</span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"><Icon type="users" className="w-4 h-4" /> {(user.connections?.length || 0)} Collegamenti</span>
              </div>
          </div>
        </div>
      </div>

      {/* 2. CARD BIO */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Icon type="info" className="w-5 h-5 text-blue-600" />
            Chi Sono
        </h2>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {user.bio || 'Nessuna presentazione inserita.'}
        </p>
      </div>

      {/* 3. ESPERIENZE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Icon type="briefcase" className="w-6 h-6 text-blue-600" />
                La mia Carriera
            </h2>
            {isOwnProfile && (
                <button onClick={() => setExperienceModal({isOpen: true, mode: 'add'})} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                    <Icon type="plus" className="w-4 h-4" /> Aggiungi
                </button>
            )}
        </div>

        {experiences.length > 0 ? (
            <div className="relative border-l-2 border-blue-100 ml-3 md:ml-4 space-y-8 pb-4">
                {experiences.map((exp, index) => (
                <div key={index} className="relative pl-6 sm:pl-8 group">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm group-hover:scale-125 transition-transform duration-300"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                            <h3 className="font-extrabold text-lg text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{exp.role}</h3>
                            <p className="text-slate-800 font-semibold mt-1 flex items-center gap-1.5">
                                <Icon type="building" className="w-4 h-4 text-slate-400" /> {exp.facility}
                            </p>
                            <p className="text-xs font-bold text-blue-600/80 mt-1 uppercase tracking-wider">{exp.period}</p>
                            {exp.description && <p className="text-sm text-slate-600 leading-relaxed mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">{exp.description}</p>}
                        </div>
                        
                        {isOwnProfile && (
                            <div className="flex items-center gap-1 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setExperienceModal({isOpen: true, mode: 'edit', experience: exp, index})} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Modifica">
                                    <Icon type="certificate" className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteExperience(index)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Elimina">
                                    <Icon type="x" className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Icon type="briefcase" className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-lg">Nessuna esperienza</p>
            </div>
        )}
      </div>

      {/* 4. CERTIFICAZIONI */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Icon type="certificate" className="w-6 h-6 text-blue-600" />
                Brevetti & Certificazioni
            </h2>
            {isOwnProfile && (
                <button onClick={() => setCertificationModal({isOpen: true, mode: 'add'})} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                    <Icon type="plus" className="w-4 h-4" /> Aggiungi
                </button>
            )}
        </div>

        {certifications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certifications.map((cert, index) => {
                    const styles = getCertStyles(cert);
                    
                    return (
                    <div key={index} className={`flex flex-col p-5 border rounded-2xl transition-all shadow-sm hover:shadow-md ${styles.bg} ${styles.border} group relative`}>
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon type="star" className={`w-4 h-4 ${styles.icon}`} />
                                    <h3 className={`font-bold leading-tight ${styles.text}`}>{cert.name}</h3>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 truncate">{cert.issuer}</p>
                            </div>
                            
                            {isOwnProfile && (
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-white p-1">
                                    <button onClick={() => setCertificationModal({isOpen: true, mode: 'edit', certification: cert, index})} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                        <Icon type="certificate" className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteCertification(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                        <Icon type="x" className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-black/5">
                            <span className="text-[10px] font-extrabold text-slate-600 bg-white/60 px-2 py-1 rounded border border-black/5 uppercase tracking-wider">{cert.category}</span>
                            {cert.expiry && <span className="text-[10px] font-bold text-red-600 bg-white/80 px-2 py-1 rounded border border-red-100">Scade: {new Date(cert.expiry).toLocaleDateString('it-IT')}</span>}
                        </div>
                    </div>
                )})}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Icon type="certificate" className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-lg">Nessun brevetto inserito</p>
            </div>
        )}
      </div>

      <ExperienceModal isOpen={experienceModal.isOpen} onClose={() => setExperienceModal({ isOpen: false, mode: 'add' })} onSave={handleSaveExperience} experience={experienceModal.experience} mode={experienceModal.mode} />
      <CertificationModal isOpen={certificationModal.isOpen} onClose={() => setCertificationModal({ isOpen: false, mode: 'add' })} onSave={handleSaveCertification} certification={certificationModal.certification} mode={certificationModal.mode} />
    </div>
  );
};