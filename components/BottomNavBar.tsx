import React from 'react';
import { Icon } from './Icon';
import type { View } from '../types';
import { useLocation } from 'react-router-dom';

interface BottomNavBarProps {
    onNavigate: (view: View, id?: number | string) => void;
    unreadMessages: number;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badgeCount?: number;
}> = ({ icon, label, isActive, onClick, badgeCount }) => (
    <button
        onClick={onClick}
        className="btn btn-ghost"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            transition: 'all var(--transition-fast)',
            color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            minHeight: '48px',
            border: 'none',
            borderRadius: 0
        }}
    >
        <div style={{ position: 'relative', marginBottom: 'var(--space-1)' }}>
            {icon}
            {badgeCount && badgeCount > 0 && (
                 <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    backgroundColor: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'var(--font-bold)',
                    borderRadius: 'var(--radius-full)',
                    height: '16px',
                    width: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                 }}>
                    {badgeCount}
                 </span>
            )}
        </div>
        <span style={{ 
            fontSize: '10px',
            fontWeight: 'var(--font-medium)',
            lineHeight: 1
        }}>
            {label}
        </span>
    </button>
);

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, unreadMessages }) => {
    const location = useLocation();
    const { pathname } = location;

    return (
        <nav 
            className="visible-mobile"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTop: '1px solid var(--color-neutral-200)',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                zIndex: 'var(--z-fixed)',
                justifyContent: 'space-around',
                paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
            }}
        >
            <NavItem 
                icon={<Icon type="home" className="w-6 h-6" />}
                label="Home"
                isActive={pathname === '/'}
                onClick={() => onNavigate('dashboard')}
            />
             <NavItem 
                icon={<Icon type="briefcase" className="w-6 h-6" />}
                label="Lavoro"
                isActive={pathname.startsWith('/jobs')}
                onClick={() => onNavigate('lavoro')}
            />
            <NavItem 
                icon={<Icon type="chat-bubble" className="w-6 h-6" />}
                label="Chat"
                isActive={pathname.startsWith('/chat')}
                onClick={() => onNavigate('messages')}
                badgeCount={unreadMessages}
            />
            <NavItem 
                icon={<Icon type="globe" className="w-6 h-6" />}
                label="Network"
                isActive={pathname.startsWith('/network')}
                onClick={() => onNavigate('network')}
            />
            <NavItem 
                icon={<Icon type="user-circle" className="w-6 h-6" />}
                label="Profilo"
                isActive={pathname.startsWith('/profile')}
                onClick={() => onNavigate('profile', 'me')}
            />
        </nav>
    );
};