// ============================================================
// FILE 1: src/App.tsx - COMPLETO E CORRETTO
// ============================================================

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Outlet, Navigate, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppwriteDebugger from './components/common/DebugPanel';
import { databaseService } from './services/database';

// Old Components
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { ProfileView } from '../components/ProfileView';
import { FacilityView } from '../components/FacilityView';
import { LavoroView } from '../components/LavoroView';
import { JobDetailView } from '../components/JobDetailView';
import { NetworkView } from '../components/NetworkView';
import { PostDetailView } from '../components/PostDetailView';
import { MyApplicationsView } from '../components/MyApplicationsView';
import { ApplicationFlowModal } from '../components/ApplicationFlowModal';
import { Settings } from '../components/Settings';

// New Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Network from './pages/Network';

// Mock Data & Types
import { PROFESSIONALS, FACILITIES, JOBS, POSTS, MY_APPLICATIONS } from './utils/mockData';
import type { ApplicationFlowState, MockJob, ProfessionalUser, AquaticFacility, MockPost, Conversation, View, AuthenticatedUser } from '../types';

// Styles
import './styles/design-system.css';
import './styles/components/buttons.css';
import './styles/components/cards.css';
import './styles/components/forms.css';
import './styles/globals.css';
import './styles/responsive.css';
import './styles/components.css';

import Profile from './pages/Profile';
import { MessagesView } from '@/components/MessagesView';

// Helper functions
const isAppwriteId = (id: string): boolean => {
    return id.length > 10 && /^[a-zA-Z0-9]+$/.test(id);
};

const isMockId = (id: string): boolean => {
    return /^\d+$/.test(id);
};

// Chat Wrapper Component
const ChatWrapper = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const startChatWithUserId = searchParams.get('userId');

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleProfileClick = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <MessagesView 
            currentUserId={user.$id}
            startChatWithUserId={startChatWithUserId}
            onProfileClick={handleProfileClick}
        />
    );
};

const AppLayout = () => {
    const { authenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [applicationFlow, setApplicationFlow] = useState<ApplicationFlowState>({ step: 'idle', job: null });

    useEffect(() => {
        if (!user) return;
        
        const loadUnreadCount = async () => {
            try {
                const count = await databaseService.getUnreadMessagesCount(user.$id);
                setUnreadMessagesCount(count);
            } catch (error) {
                console.error('Error loading unread messages count:', error);
            }
        };

        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleNavigate = (view: View, id?: number | string) => {
        switch (view) {
            case 'dashboard': navigate('/'); break;
            case 'profile':
                if (!id) {
                    navigate(`/profile/${user?.$id}`);
                } else {
                    navigate(`/profile/${id}`);
                }
                break;
            case 'facility': navigate(`/facility/${id}`); break;
            case 'lavoro': navigate('/jobs'); break;
            case 'jobDetail': navigate(`/jobs/${id}`); break;
            case 'messages': 
                if (id) {
                    navigate(`/chat?userId=${id}`);
                } else {
                    navigate('/chat');
                }
                break;
            case 'network': navigate('/network'); break;
            case 'postDetail': navigate(`/post/${id}`); break;
            case 'myApplications': navigate('/my-applications'); break;
            case 'settings': navigate('/settings'); break;
        }
    };

    const handleApply = (job: MockJob) => {
        setApplicationFlow({ step: 'custom_analysis', job });
    };

    const handleApplicationSubmit = () => {
        setApplicationFlow(prev => ({ ...prev, step: 'confirmation' }));
    };

    if (!authenticated || !user) {
        return <Navigate to="/login" />;
    }

    const mockCurrentUser = PROFESSIONALS.find(p => p.email.toLowerCase() === user.email.toLowerCase()) || PROFESSIONALS[0];

    const hideNavOnRoutes = ['/login', '/register'];
    const showNavigation = !hideNavOnRoutes.includes(location.pathname);

    return (
        <div className="app">
            {showNavigation && (
                <Header
                    currentUser={user}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    unreadMessages={unreadMessagesCount}
                    connectionRequests={1}
                />
            )}
            
            <main className={`main-content ${showNavigation ? 'with-header' : ''}`}>
                <Outlet context={{ handleNavigate, handleApply }} />
            </main>
            
            {showNavigation && (
                <BottomNavBar
                    onNavigate={handleNavigate}
                    unreadMessages={unreadMessagesCount}
                />
            )}
            
            {applicationFlow.job && (
                <ApplicationFlowModal
                    user={mockCurrentUser}
                    job={applicationFlow.job as MockJob}
                    flowState={applicationFlow}
                    setFlowState={setApplicationFlow}
                    onSubmit={handleApplicationSubmit}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
};

const JobDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { handleApply } = useOutletContext<any>();
    const job = JOBS.find(j => j.id === parseInt(id!));
    if (!job) return <div>Job not found</div>;
    return <JobDetailView job={job} onBack={() => navigate('/jobs')} onApply={handleApply} />;
};

const LavoroWrapper = () => {
    const { handleNavigate, handleApply } = useOutletContext<any>();
    return <LavoroView onSelectJob={(id) => handleNavigate('jobDetail', id)} onApply={handleApply} onShowMyApplications={() => handleNavigate('myApplications')} />
};

const SettingsWrapper = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleNavigate = (view: View) => {
        switch (view) {
            case 'dashboard': navigate('/'); break;
            case 'profile': navigate(`/profile/${user?.$id}`); break;
            case 'messages': navigate('/chat'); break;
            case 'network': navigate('/network'); break;
            case 'lavoro': navigate('/jobs'); break;
            default: navigate('/'); break;
        }
    };

    const handleLogout = async () => {
        try {
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <Settings 
            currentUser={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
        />
    );
};

// ============================================================
// SOSTITUISCI IL ProfileWrapper IN App.tsx CON QUESTO:
// ============================================================

const ProfileWrapper = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, [id, user]);

    const loadProfile = async () => {
        if (!id || !user) {
            setError('Invalid profile ID or user not logged in');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            console.log('🔍 Loading profile for ID:', id);
            console.log('🔍 Current user ID:', user.$id);

            // Determina se è il proprio profilo
            const isOwnProfile = id === user.$id;
            console.log('🔍 Is own profile?', isOwnProfile);

            let profile;
            if (isOwnProfile) {
                // Usa i dati dell'utente corrente
                console.log('✅ Loading own profile from current user');
                profile = user;
            } else {
                // Carica il profilo da Appwrite (prova prima users, poi structures)
                console.log('🔍 Loading other user profile from database');
                try {
                    profile = await databaseService.getUserProfile(id);
                    console.log('✅ User profile loaded');
                } catch (error) {
                    console.log('⚠️ Not a user profile, trying structure...');
                    profile = await databaseService.getStructureProfile(id);
                    console.log('✅ Structure profile loaded');
                }
            }

            // Adatta il profilo per ProfileView
            const adaptedProfile = {
                id: 1, // Mock ID per compatibilità
                userId: profile.userId || profile.$id,
                name: profile.userType === 'professional' 
                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() 
                    : profile.structureName || 'User',
                email: profile.email || '',
                avatarUrl: profile.userType === 'professional'
                    ? profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.firstName || '') + ' ' + (profile.lastName || ''))}&background=3b82f6&color=fff`
                    : profile.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.structureName || 'User')}&background=3b82f6&color=fff`,
                title: profile.userType === 'professional' 
                    ? profile.bio?.substring(0, 50) || 'Professionista del Nuoto'
                    : profile.structureType || 'Struttura',
                location: profile.userType === 'professional'
                    ? `${profile.city || ''}${profile.province ? ', ' + profile.province : ''}`.trim() || 'Location not set'
                    : `${profile.city || ''}${profile.province ? ', ' + profile.province : ''}`.trim() || 'Location not set',
                connections: profile.connectionCount || 0,
                bio: profile.bio || profile.description || '',
                specializations: profile.qualifications || profile.services || [],
                experience: profile.experienceList || [],
                certifications: profile.certificationsList || [],
                phone: profile.phone || '',
            };

            console.log('✅ Profile adapted:', adaptedProfile);
            setProfileUser(adaptedProfile);
            setIsLoading(false);
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            setError('Impossibile caricare il profilo');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="container">
                <div className="card card-elevated card-comfortable text-center">
                    <h2 className="card-title card-title-lg">Profilo non disponibile</h2>
                    <p className="card-description">{error || 'Questo profilo non è accessibile.'}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-primary btn-md"
                    >
                        Torna alla Home
                    </button>
                </div>
            </div>
        );
    }

    // CALCOLA isOwnProfile QUI - IMPORTANTE!
    const isOwnProfile = id === user?.$id;
    console.log('🔍 Final isOwnProfile check:', { id, userId: user?.$id, isOwnProfile });

    return (
        <ProfileView
            user={profileUser}
            onBack={() => navigate(-1)}
            onContact={(userId) => {
                console.log('🔍 Starting chat with userId:', userId);
                navigate(`/chat?userId=${userId}`);
            }}
            isOwnProfile={isOwnProfile}
        />
    );
};

const FacilityWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const facility = FACILITIES.find(f => f.id === parseInt(id!));
    if (!facility) return <div>Facility not found</div>;
    return <FacilityView facility={facility} onBack={() => navigate(-1)} onSelectProfile={(pid) => navigate(`/profile/${pid}`)} />;
};

const PostDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = POSTS.find(p => p.id === parseInt(id!));
    if (!post) return <div>Post not found</div>;
    return <PostDetailView post={post} onBack={() => navigate('/')} onSelectProfile={(pid) => navigate(`/profile/${pid}`)} />;
};

const MyApplicationsWrapper = () => {
    const navigate = useNavigate();
    return <MyApplicationsView applications={MY_APPLICATIONS} onBack={() => navigate('/jobs')} onSelectJob={(id) => navigate(`/jobs/${id}`)} />;
};

const SwimWaveUpApp = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Home />} />
                        <Route path="jobs" element={<LavoroWrapper />} />
                        <Route path="jobs/:id" element={<JobDetailWrapper />} />
                        <Route path="network" element={<Network />} />
                        <Route path="chat" element={<ChatWrapper />} />
                        <Route path="profile/:id" element={<ProfileWrapper />} />
                        <Route path="facility/:id" element={<FacilityWrapper />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<SettingsWrapper />} />
                        <Route path="my-applications" element={<MyApplicationsWrapper />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default SwimWaveUpApp;