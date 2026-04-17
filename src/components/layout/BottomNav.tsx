import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Query } from 'appwrite';
import { Icon, type IconType } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { databases, client } from '@/services/appwrite';
import { APPWRITE_CONFIG } from '@/config/constants';
import { useToast } from '@/context/ToastContext';

interface NavItemProps {
    to: string;
    icon: IconType;
    label: string;
    badgeCount?: number;
    isLive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badgeCount, isLive }) => (
    <NavLink
        to={to}
        aria-label={label}
        className={({ isActive }) => `
            flex flex-col items-center justify-center w-full min-h-[56px] py-1 transition-colors duration-200 outline-none
            ${isLive 
                ? (isActive ? 'text-red-600' : 'text-slate-500 hover:text-red-600') 
                : (isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800')
            }
        `}
    >
        {({ isActive }) => (
            <>
                <div className="relative mb-1">
                    <Icon type={icon} className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                    
                    {/* Badge Messaggi Classico */}
                    {badgeCount !== undefined && badgeCount > 0 && !isLive && (
                        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-200">
                            {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                    )}

                    {/* Badge "On Air" */}
                    {isLive && (
                        <span className="absolute -top-0.5 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                        </span>
                    )}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                    {label}
                </span>
            </>
        )}
    </NavLink>
);

const BottomNav: React.FC = () => {
    const { user, authenticated } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { showToast } = useToast();
    const location = useLocation();

    const fetchUnreadCount = useCallback(async () => {
        if (!user?.$id) return;
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages,
                [Query.equal('receiverId', user.$id), Query.equal('isRead', false), Query.limit(100)]
            );
            setUnreadMessages(response.total);
        } catch (error) {
            console.error('Failed to fetch unread count');
        }
    }, [user?.$id]);

    useEffect(() => {
        if (!authenticated || !user?.$id) return;
        
        fetchUnreadCount();

        const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.messages}.documents`;
        const unsubscribe = client.subscribe(channel, (response: any) => {
            const message = response.payload;
            if (message.receiverId === user.$id) {
                const isCreate = response.events.some((e: string) => e.includes('.create'));
                const isUpdate = response.events.some((e: string) => e.includes('.update'));
                
                if (isCreate && !message.isRead) {
                    setUnreadMessages(prev => prev + 1);
                    if (!location.pathname.startsWith('/messages')) {
                        showToast('Hai ricevuto un nuovo messaggio!', 'info');
                    }
                }
                if (isUpdate && message.isRead) {
                    fetchUnreadCount();
                }
            }
        });

        return () => unsubscribe();
    }, [user?.$id, authenticated, fetchUnreadCount, location.pathname, showToast]);

    if (!authenticated) return null;

    return (
        <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-around items-end"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))', height: 'calc(4rem + env(safe-area-inset-bottom))' }}
            aria-label="Menu di navigazione mobile"
            role="navigation"
        >
            <NavItem to="/" icon="home" label="Home" />
            <NavItem to="/jobs" icon="briefcase" label="Lavoro" />
            
            <NavItem to="/live" icon="video" label="Live" isLive />
            
            <NavItem to="/messages" icon="chat-bubble" label="Chat" badgeCount={unreadMessages} />
            <NavItem to="/network" icon="globe" label="Network" />
            <NavItem to="/profile" icon="user-circle" label="Profilo" />
        </nav>
    );
};

export default BottomNav;