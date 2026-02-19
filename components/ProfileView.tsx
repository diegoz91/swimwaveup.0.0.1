// ============================================================
// components/ProfileView.tsx - CON MODIFICA FOTO PROFILO
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import type { ProfessionalUser, Experience, Certification } from '../types';
import { Icon } from './Icon';
import { generateProfileSummary } from '../services/geminiService';
import { ExperienceModal } from './ExperienceModal';
import { CertificationModal } from './CertificationModal';
import { useAuth } from '@/src/hooks/useAuth';
import { databaseService } from '@/src/services/database';

interface ProfileViewProps {
  user: ProfessionalUser & { userId?: string };
  onBack: () => void;
  onContact: (userId: string) => void;
  isOwnProfile?: boolean;
}

const InfoPill: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
    <div className="flex items-center bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm">
        {icon}
        <span>{text}</span>
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
    
    // ========== STATO PER LA FOTO PROFILO ==========
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [experienceModal, setExperienceModal] = useState<{
      isOpen: boolean;
      mode: 'add' | 'edit';
      experience?: Experience;
      index?: number;
    }>({
      isOpen: false,
      mode: 'add'
    });
    
    const [certificationModal, setCertificationModal] = useState<{
      isOpen: boolean;
      mode: 'add' | 'edit';
      certification?: Certification;
      index?: number;
    }>({
      isOpen: false,
      mode: 'add'
    });

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setSummary('');
        const generatedSummary = await generateProfileSummary(user);
        setSummary(generatedSummary);
        setIsLoading(false);
    }, [user]);

    // ========== GESTIONE FOTO PROFILO ==========
    const handleAvatarClick = () => {
      if (isOwnProfile && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !authUser) return;

      // Validazione file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Formato non supportato. Usa JPG, PNG, WebP o GIF.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Immagine troppo grande. Massimo 5MB.');
        return;
      }

      try {
        setIsUploadingImage(true);
        
        // Upload dell'immagine
        const newAvatarUrl = await databaseService.uploadProfileImage(authUser.$id, file);
        
        // Aggiorna lo stato locale
        setAvatarUrl(newAvatarUrl);
        
        // Aggiorna il contesto auth se disponibile
        if (refreshProfile) {
          await refreshProfile();
        }
        
        console.log('✅ Avatar aggiornato con successo!');
      } catch (error) {
        console.error('❌ Errore upload immagine:', error);
        alert('Errore durante il caricamento dell\'immagine. Riprova.');
      } finally {
        setIsUploadingImage(false);
        // Reset input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    // ========== GESTIONE ESPERIENZA ==========
    const handleAddExperience = () => {
      setExperienceModal({
        isOpen: true,
        mode: 'add'
      });
    };

    const handleEditExperience = (experience: Experience, index: number) => {
      setExperienceModal({
        isOpen: true,
        mode: 'edit',
        experience,
        index
      });
    };

    const handleSaveExperience = async (experienceData: Experience) => {
      try {
        const currentExperience = user.experience || [];
        
        if (experienceModal.mode === 'add') {
          const updatedExperience = [...currentExperience, experienceData];
          await updateProfile({ 
            experienceList: updatedExperience
          });
        } else if (experienceModal.mode === 'edit' && experienceModal.index !== undefined) {
          const updatedExperience = [...currentExperience];
          updatedExperience[experienceModal.index] = experienceData;
          await updateProfile({ 
            experienceList: updatedExperience
          });
        }
        
        setExperienceModal({ isOpen: false, mode: 'add' });
      } catch (error) {
        console.error('Error saving experience:', error);
        throw error;
      }
    };

    // ========== GESTIONE CERTIFICAZIONI ==========
    const handleAddCertification = () => {
      setCertificationModal({
        isOpen: true,
        mode: 'add'
      });
    };

    const handleEditCertification = (certification: Certification, index: number) => {
      setCertificationModal({
        isOpen: true,
        mode: 'edit',
        certification,
        index
      });
    };

    const handleSaveCertification = async (certificationData: Certification) => {
      try {
        const currentCertifications = user.certifications || [];
        
        if (certificationModal.mode === 'add') {
          const updatedCertifications = [...currentCertifications, certificationData];
          await updateProfile({ 
            certificationsList: updatedCertifications 
          });
        } else if (certificationModal.mode === 'edit' && certificationModal.index !== undefined) {
          const updatedCertifications = [...currentCertifications];
          updatedCertifications[certificationModal.index] = certificationData;
          await updateProfile({ 
            certificationsList: updatedCertifications 
          });
        }
        
        setCertificationModal({ isOpen: false, mode: 'add' });
      } catch (error) {
        console.error('Error saving certification:', error);
        throw error;
      }
    };

    const handleContactClick = () => {
      const userIdToUse = user.userId || String(user.id);
      console.log('🔍 Contacting user:', userIdToUse);
      onContact(userIdToUse);
    };

    return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Indietro</button>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="h-40 bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/seed/bg${user.id}/1200/400)`}}></div>
        <div className="p-6">
          <div className="flex items-end -mt-24">
            
            {/* ========== FOTO PROFILO CON OVERLAY PER MODIFICA ========== */}
            <div className="relative group">
              <img 
                src={avatarUrl} 
                alt={user.name} 
                className={`w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg ${
                  isOwnProfile ? 'cursor-pointer' : ''
                } ${isUploadingImage ? 'opacity-50' : ''}`}
                onClick={handleAvatarClick}
              />
              
              {/* Overlay per modifica - visibile solo se isOwnProfile */}
              {isOwnProfile && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {isUploadingImage ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <div className="text-center text-white">
                      <Icon type="camera" className="w-8 h-8 mx-auto" />
                      <span className="text-xs font-medium">Modifica</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Input file nascosto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
              <p className="text-slate-600">{user.title}</p>
            </div>
          </div>
          
          {/* BOTTONI - NASCOSTI SE È IL PROPRIO PROFILO */}
          {!isOwnProfile && (
            <div className="flex space-x-4 mt-4">
              <button 
                onClick={handleContactClick}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <Icon type="mail" className="w-5 h-5"/>
                <span>Contatta</span>
              </button>
              <button className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-full hover:bg-slate-300 transition flex items-center space-x-2">
                <Icon type="plus" className="w-5 h-5"/>
                <span>Collegati</span>
              </button>
            </div>
          )}

          {/* MESSAGGIO SE È IL PROPRIO PROFILO */}
          {isOwnProfile && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <Icon type="info" className="w-4 h-4 inline mr-2" />
                Questo è il tuo profilo. Passa il mouse sulla foto per modificarla.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoPill icon={<Icon type="location" className="w-4 h-4 mr-2" />} text={user.location} />
            <InfoPill icon={<Icon type="users" className="w-4 h-4 mr-2" />} text={`${user.connections} collegamenti`} />
        </div>

        <div className="p-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Riepilogo Professionale (AI)</h2>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                    <p className="text-slate-700 italic">
                        {isLoading ? 'Generazione in corso...' : summary || 'Clicca il pulsante per generare un riepilogo con l\'AI.'}
                    </p>
                    <button 
                        onClick={handleGenerateSummary}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-200 disabled:opacity-50 disabled:cursor-wait"
                    >
                       <Icon type="sparkles" className="w-4 h-4"/>
                       <span>{isLoading ? 'Attendi' : 'Genera'}</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Specializzazioni</h2>
          <div className="flex flex-wrap gap-2">
            {user.specializations.map(spec => (
              <span key={spec} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{spec}</span>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Esperienza Lavorativa</h2>
            {isOwnProfile && (
              <button
                onClick={handleAddExperience}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Icon type="plus" className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            )}
          </div>
          <div className="space-y-6">
            {user.experience.map((exp, index) => (
              <div key={index} className="flex space-x-4 group">
                <Icon type="briefcase" className="w-8 h-8 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-700">{exp.role}</h3>
                      <p className="text-slate-600">{exp.facility}</p>
                      <p className="text-sm text-slate-500">{exp.period}</p>
                      <p className="mt-2 text-slate-600">{exp.description}</p>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => handleEditExperience(exp, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                      >
                        <Icon type="settings" className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Brevetti e Certificazioni</h2>
            {isOwnProfile && (
              <button
                onClick={handleAddCertification}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Icon type="plus" className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            )}
          </div>
          <ul className="space-y-4">
            {user.certifications.map((cert, index) => (
              <li key={index} className="flex items-center space-x-4 group">
                <Icon type="certificate" className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-700">{cert.name}</p>
                      <p className="text-sm text-slate-500">Rilasciato da: {cert.issuer}</p>
                      {cert.expiry && <p className="text-sm text-slate-500">Scadenza: {cert.expiry}</p>}
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => handleEditCertification(cert, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                      >
                        <Icon type="settings" className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ExperienceModal
        isOpen={experienceModal.isOpen}
        onClose={() => setExperienceModal({ isOpen: false, mode: 'add' })}
        onSave={handleSaveExperience}
        experience={experienceModal.experience}
        mode={experienceModal.mode}
      />

      <CertificationModal
        isOpen={certificationModal.isOpen}
        onClose={() => setCertificationModal({ isOpen: false, mode: 'add' })}
        onSave={handleSaveCertification}
        certification={certificationModal.certification}
        mode={certificationModal.mode}
      />
    </div>
  );
};