import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';
import { client } from '@/services/appwrite';
import { APPWRITE_CONFIG } from '@/config/constants';
import { PostCreator } from '@/features/feed/components/PostCreator';
import { PostCard } from '@/features/feed/components/PostCard';
import { PostDetailView } from '@/features/feed/components/PostDetailView';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/context/ToastContext';
import type { Post, Job } from '@/types/types';

const Home: React.FC = () => {
    const { user, authenticated } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    
    const [latestJobs, setLatestJobs] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    const POSTS_PER_PAGE = 10;

    const loadFeed = useCallback(async (offset = 0, append = false) => {
        if (offset === 0) setIsLoading(true);
        else setIsFetchingMore(true);
        
        try {
            const fetchedPosts = await databaseService.getFeed(POSTS_PER_PAGE, offset);
            if (fetchedPosts.length < POSTS_PER_PAGE) setHasMore(false);
            setPosts(prev => append ? [...prev, ...fetchedPosts] : fetchedPosts);
        } catch (err) {
            showToast('Errore di connessione. Impossibile aggiornare il feed.', 'error');
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [showToast]);

    const loadSidebarJobs = useCallback(async () => {
        try {
            const activeJobs = await databaseService.getActiveJobs();
            setLatestJobs(activeJobs.slice(0, 3));
        } catch (err) {} finally {
            setIsLoadingJobs(false);
        }
    }, []);

    useEffect(() => {
        if (!authenticated) return;
        loadFeed();
        loadSidebarJobs();

        const unsubscribe = client.subscribe(
            `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.posts}.documents`,
            (response: any) => {
                const events = response.events;
                if (events.some((e: string) => e.includes('.create'))) {
                    setPosts(prev => [response.payload as Post, ...prev]);
                }
                if (events.some((e: string) => e.includes('.delete'))) {
                    setPosts(prev => prev.filter(p => p.$id !== response.payload.$id));
                }
            }
        );

        return () => unsubscribe();
    }, [authenticated, loadFeed, loadSidebarJobs]);

    if (!user) return null;

    const displayAvatar = user.userType === 'professional' ? user.avatar : user.logo;
    const displayName = user.userType === 'professional' ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.structureName;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=eff6ff&color=1d4ed8`;

    return (
        <div className="pt-20 md:pt-24 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 pb-24 md:pb-8 animate-in fade-in duration-500">
            {/* Sidebar Sinistra */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                    <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                    <div className="px-5 pb-5">
                        <div className="relative -mt-8 mb-3 flex justify-center cursor-pointer" onClick={() => navigate('/profile')}>
                            <img src={displayAvatar || defaultAvatar} alt="Il tuo profilo" className="w-16 h-16 rounded-full border-4 border-white shadow-sm object-cover bg-slate-50 hover:scale-105 transition-transform" />
                        </div>
                        <div className="text-center mb-5 cursor-pointer group" onClick={() => navigate('/profile')}>
                            <h2 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{displayName}</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{user.title || user.structureType || 'Membro SwimIn'}</p>
                        </div>
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <div className="flex justify-between items-center text-xs font-semibold cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors" onClick={() => navigate('/network')}>
                                <span className="text-slate-500">Collegamenti di rete</span>
                                <span className="text-blue-600">{user.connections?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Feed Centrale / Dettaglio Post */}
            <main className="flex-1 max-w-2xl mx-auto w-full">
                
                {selectedPost ? (
                    <PostDetailView 
                        post={selectedPost} 
                        onBack={() => setSelectedPost(null)} 
                    />
                ) : (
                    <>
                        <PostCreator onPostCreated={() => { loadFeed(); }} />

                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map(n => (
                                    <div key={n} className="bg-white rounded-3xl border border-slate-200 p-5 animate-pulse shadow-sm">
                                        <div className="flex gap-3 mb-4">
                                            <div className="w-12 h-12 bg-slate-200 rounded-full" />
                                            <div className="flex-1 py-1"><div className="h-4 bg-slate-200 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-200 rounded w-1/4" /></div>
                                        </div>
                                        <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                                    </div>
                                ))
                            ) : posts.length > 0 ? (
                                <>
                                    {posts.map(post => (
                                        <PostCard 
                                            key={post.$id} 
                                            post={post} 
                                            onSelectPost={setSelectedPost} 
                                        />
                                    ))}
                                    {hasMore && (
                                        <div className="py-6 flex justify-center">
                                            <button onClick={() => !isFetchingMore && loadFeed(posts.length, true)} disabled={isFetchingMore} className="text-blue-600 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50">
                                                {isFetchingMore ? <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> : "Mostra altri post"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icon type="globe" className="w-10 h-10" /></div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ancora nessun tuffo!</h2>
                                    <p className="text-slate-500 max-w-xs mx-auto font-medium">La bacheca è tranquilla. Sii il primo a rompere il ghiaccio.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Sidebar Destra */}
            <aside className="hidden xl:block w-80 flex-shrink-0">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-6">
                        <h3 className="font-extrabold text-slate-900">Ultime Opportunità</h3>
                        <Icon type="sparkles" className="w-4 h-4 text-blue-600" />
                    </div>
                    {isLoadingJobs ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="animate-pulse flex gap-3"><div className="w-10 h-10 bg-slate-200 rounded-lg"/><div className="flex-1"><div className="h-3 bg-slate-200 w-3/4 mb-2"/><div className="h-2 bg-slate-200 w-1/2"/></div></div>)}
                        </div>
                    ) : latestJobs.length > 0 ? (
                        <div className="space-y-5">
                            {latestJobs.map(job => (
                                <div key={job.$id} onClick={() => navigate('/jobs')} className="flex gap-3 cursor-pointer group p-2 -mx-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <img src={job.facilityLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.structureName || 'S')}&background=f8fafc&color=3b82f6`} alt="Logo" className="w-10 h-10 rounded-lg bg-slate-50 object-cover border border-slate-100 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate">{job.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 truncate">{job.structureName || 'Struttura'} • {job.city}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => navigate('/jobs')} className="w-full mt-4 py-2.5 px-4 bg-slate-50 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">
                                Vedi tutte le offerte
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 font-medium text-center py-4">Nessun annuncio al momento.</p>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Home;