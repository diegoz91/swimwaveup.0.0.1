import React, { useState, useCallback, useRef } from 'react';
import type { UserProfile, StructureProfile, Experience, Certification } from '../types';
import { Icon } from './Icon';
import { ExperienceModal } from './ExperienceModal';
import { CertificationModal } from './CertificationModal';
import { useAuth } from '../src/hooks/useAuth';
import { databaseService } from '../src/services/database';

interface ProfileViewProps {
  user: UserProfile | StructureProfile;
  onBack: () => void;
  onContact: (userId: string) => void;
  isOwnProfile?: boolean;
}

const InfoPill: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
    <div className="flex items-center bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm">
        {icon}
        <span className="truncate">{text}</span>
    </div>
);

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  onBack, 
  onContact, 
  isOwnProfile = false 
}) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user: authUser, updateProfile, refreshProfile } = useAuth();
    
    const isProfessional = user.userType === 'professional';
    const profUser = isProfessional ? (user as UserProfile) : null;
    const structUser = !isProfessional ? (user as StructureProfile) : null;

    const displayId = user.userId || user.$id;
    const displayName = isProfessional 
        ? `${profUser?.firstName || ''} ${profUser?.lastName || ''}`.trim() || 'Utente'
        : structUser?.structureName || 'Struttura';
    const displayTitle = isProfessional ? profUser?.title : structUser?.structureType;
    const displayLocation = user.city ? `${user.city}${user.province ? ` (${user.province})` : ''}` : 'Sede non specificata';

    // ========== STATO PER LA FOTO PROFILO ==========
    const initialAvatar = isProfessional ? profUser?.avatar : structUser?.logo;
    const [avatarUrl, setAvatarUrl] = useState(initialAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=1d4ed8`);
    
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [experienceModal, setExperienceModal] = useState<{isOpen: boolean; mode: 'add' | 'edit'; experience?: Experience; index?: number;}>({ isOpen: false, mode: 'add' });
    const [certificationModal, setCertificationModal] = useState<{isOpen: boolean; mode: 'add' | 'edit'; certification?: Certification; index?: number;}>({ isOpen: false, mode: 'add' });

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setSummary('');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSummary('⚠️ La generazione AI del profilo è temporaneamente in manutenzione per aggiornamenti di sicurezza. La funzione tornerà attiva col prossimo rilascio.');
        setIsLoading(false);
    }, []);

    // ========== GESTIONE FOTO PROFILO ==========
    const handleAvatarClick = () => {
      if (isOwnProfile && fileInputRef.current) fileInputRef.current.click();
    };

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !authUser) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Formato non supportato. Usa JPG, PNG o WebP.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Immagine troppo grande. Massimo 5MB.');
        return;
      }

      try {
        setIsUploadingImage(true);
        const newAvatarUrl = await databaseService.uploadProfileImage(authUser.$id, file);
        setAvatarUrl(newAvatarUrl);
        if (refreshProfile) await refreshProfile();
      } catch (error) {
        console.error('Errore upload immagine:', error);
        alert("Errore durante il caricamento dell'immagine.");
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    // ========== GESTIONE DATI DINAMICI ==========
    const handleSaveExperience = async (experienceData: Experience) => {
      if (!isProfessional || !profUser) return;
      try {
        const currentExp = profUser.experienceList || [];
        const updatedExp = experienceModal.mode === 'add' 
            ? [...currentExp, experienceData]
            : currentExp.map((exp, i) => i === experienceModal.index ? experienceData : exp);
            
        await updateProfile({ experienceList: updatedExp });
        if (refreshProfile) await refreshProfile();
        setExperienceModal({ isOpen: false, mode: 'add' });
      } catch (error) { throw error; }
    };

    const handleSaveCertification = async (certData: Certification) => {
      if (!isProfessional || !profUser) return;
      try {
        const currentCerts = profUser.certificationsList || [];
        const updatedCerts = certificationModal.mode === 'add'
            ? [...currentCerts, certData]
            : currentCerts.map((cert, i) => i === certificationModal.index ? certData : cert);
            
        await updateProfile({ certificationsList: updatedCerts });
        if (refreshProfile) await refreshProfile();
        setCertificationModal({ isOpen: false, mode: 'add' });
      } catch (error) { throw error; }
    };

    return (
    <div className="max-w-4xl mx-auto w-full pb-20 md:pb-8">
      <button 
        onClick={onBack} 
        className="mb-4 text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-all"
      >
        <Icon type="x" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Indietro
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Cover Background */}
        <div className="h-48 sm:h-64 bg-slate-200 bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/seed/bg${displayId}/1200/400)`}}></div>
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-20 sm:-mt-24 mb-6 sm:mb-8 gap-4 sm:gap-6 relative z-10">
            
            {/* Foto Profilo */}
            <div className="relative group w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className={`w-full h-full rounded-full border-4 border-white object-cover shadow-lg bg-white ${isOwnProfile ? 'cursor-pointer' : ''} ${isUploadingImage ? 'opacity-50 blur-sm' : ''}`}
                onClick={handleAvatarClick}
              />
              
              {isOwnProfile && (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent"
                  onClick={handleAvatarClick}
                  title="Modifica foto"
                >
                  {isUploadingImage ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Icon type="camera" className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs font-bold text-white">Modifica</span>
                    </>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
            </div>
            
            <div className="flex-1 w-full pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">{displayName}</h1>
              <p className="text-lg text-slate-600 font-medium mt-1">{displayTitle}</p>
            </div>

            {/* Pulsanti Azione */}
            {!isOwnProfile && (
              <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <button 
                  onClick={() => onContact(displayId)}
                  className="flex-1 sm:flex-none bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon type="mail" className="w-5 h-5"/>
                  <span>Contatta</span>
                </button>
                <button className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Icon type="plus" className="w-5 h-5"/>
                  <span>Segui</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoPill icon={<Icon type="location" className="w-5 h-5 text-blue-500 mr-2" />} text={displayLocation} />
            <InfoPill icon={<Icon type="users" className="w-5 h-5 text-blue-500 mr-2" />} text={`+500 collegamenti`} />
          </div>

          {/* AI Summary */}
          {isProfessional && (
              <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <Icon type="sparkles" className="w-5 h-5 text-blue-600" />
                        Riepilogo AI
                    </h2>
                    {isOwnProfile && (
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition-colors shadow-sm w-full sm:w-auto flex justify-center"
                        >
                            {isLoading ? 'Generazione...' : 'Aggiorna Riepilogo'}
                        </button>
                    )}
                </div>
                <p className="text-slate-700 italic leading-relaxed text-[15px]">
                    {isLoading ? 'Analisi del profilo in corso...' : summary || profUser?.bio || 'Il tuo riepilogo professionale apparirà qui.'}
                </p>
              </div>
          )}

          {/* Esperienza Lavorativa */}
          {isProfessional && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Icon type="briefcase" className="w-6 h-6 text-slate-400" />
                        Esperienza
                    </h2>
                    {isOwnProfile && (
                    <button onClick={() => setExperienceModal({ isOpen: true, mode: 'add' })} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Aggiungi Esperienza">
                        <Icon type="plus" className="w-6 h-6" />
                    </button>
                    )}
                </div>
                
                <div className="space-y-6">
                    {(profUser?.experienceList || []).length > 0 ? (
                        profUser.experienceList?.map((exp, index) => (
                        <div key={index} className="flex gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                                <Icon type="building" className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{exp.role}</h3>
                                        <p className="text-slate-600 font-medium">{exp.facility}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">{exp.period}</p>
                                    </div>
                                    {isOwnProfile && (
                                    <button onClick={() => setExperienceModal({ isOpen: true, mode: 'edit', experience: exp, index })} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-2 transition-all">
                                        <Icon type="settings" className="w-5 h-5" />
                                    </button>
                                    )}
                                </div>
                                <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{exp.description}</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl">Nessuna esperienza inserita.</p>
                    )}
                </div>
              </div>
          )}

          {/* Certificazioni */}
          {isProfessional && (
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Icon type="certificate" className="w-6 h-6 text-slate-400" />
                        Brevetti e Certificazioni
                    </h2>
                    {isOwnProfile && (
                    <button onClick={() => setCertificationModal({ isOpen: true, mode: 'add' })} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Aggiungi Certificazione">
                        <Icon type="plus" className="w-6 h-6" />
                    </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(profUser?.certificationsList || []).length > 0 ? (
                        profUser.certificationsList?.map((cert, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow group bg-white relative">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Icon type="certificate" className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                                <p className="font-bold text-slate-800 truncate" title={cert.name}>{cert.name}</p>
                                <p className="text-sm text-slate-600 truncate">{cert.issuer}</p>
                                {cert.expiry && <p className="text-xs text-slate-400 mt-1">Scadenza: {new Date(cert.expiry).toLocaleDateString('it-IT')}</p>}
                            </div>
                            {isOwnProfile && (
                                <button onClick={() => setCertificationModal({ isOpen: true, mode: 'edit', certification: cert, index })} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all">
                                    <Icon type="settings" className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl sm:col-span-2">Nessuna certificazione inserita.</p>
                    )}
                </div>
              </div>
          )}
        </div>
      </div>

      <ExperienceModal isOpen={experienceModal.isOpen} onClose={() => setExperienceModal({ isOpen: false, mode: 'add' })} onSave={handleSaveExperience} experience={experienceModal.experience} mode={experienceModal.mode} />
      <CertificationModal isOpen={certificationModal.isOpen} onClose={() => setCertificationModal({ isOpen: false, mode: 'add' })} onSave={handleSaveCertification} certification={certificationModal.certification} mode={certificationModal.mode} />
    </div>
  );
};