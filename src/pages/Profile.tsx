import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';
import { useToast } from '@/context/ToastContext';
import { ProfileView } from '@/features/profile/components/ProfileView';
import { FacilityView } from '@/features/profile/components/FacilityView';
import { Settings } from '@/features/profile/components/Settings';
import type { UserProfile, StructureProfile, Job } from '@/types/types';

type ProfileType = UserProfile | StructureProfile;

const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [viewedProfile, setViewedProfile] = useState<ProfileType | null>(null);
    const [openJobs, setOpenJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

    const isOwnProfile = !id || id === currentUser?.$id;

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                let targetProfile: ProfileType | null = null;
                
                if (isOwnProfile && currentUser) {
                    targetProfile = currentUser;
                } else if (id) {
                    targetProfile = await databaseService.getProfile(id);
                }

                if (targetProfile) {
                    setViewedProfile(targetProfile);
                    
                    if (targetProfile.userType === 'structure') {
                        const allJobs = await databaseService.getActiveJobs();
                        const structureId = targetProfile.userId || targetProfile.$id;
                        setOpenJobs(allJobs.filter(job => job.structureId === structureId));
                    }
                }
            } catch (error) {
                showToast('Impossibile caricare il profilo.', 'error');
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [id, isOwnProfile, currentUser, navigate, showToast]);

    if (isLoading) {
        return (
            <div className="pt-32 flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    if (!viewedProfile || !currentUser) return null;

    const handleContact = (userId: string) => {
        navigate(`/messages`, { state: { startChatWithUserId: userId } });
    };

    const handleProfileUpdate = (updatedProfile: ProfileType) => {
        setViewedProfile(updatedProfile);
        showToast('Profilo aggiornato con successo!', 'success');
    };

    return (
        <div className="pt-20 md:pt-24 px-4 w-full h-full relative">
            
            {/* Navigazione per Profilo */}
            {isOwnProfile && (
                <div className="max-w-4xl mx-auto mb-6 flex justify-center sm:justify-start">
                    <div className="bg-slate-200/50 p-1.5 rounded-full flex gap-1">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Il mio Profilo
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Impostazioni
                        </button>
                    </div>
                </div>
            )}

            {/* Rendering della Vista */}
            {activeTab === 'profile' ? (
                viewedProfile.userType === 'professional' ? (
                    <ProfileView 
                        user={viewedProfile as UserProfile} 
                        onBack={() => navigate(-1)} 
                        onContact={handleContact}
                        isOwnProfile={isOwnProfile}
                        onUpdateProfile={handleProfileUpdate}
                    />
                ) : (
                    <FacilityView
                        facility={viewedProfile as StructureProfile}
                        openJobs={openJobs}
                        onBack={() => navigate(-1)}
                        onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
                    />
                )
            ) : (
                <Settings 
                    currentUser={currentUser}
                    onNavigate={(view) => setActiveTab('profile')}
                    onLogout={logout}
                />
            )}
        </div>
    );
};

export default ProfilePage;