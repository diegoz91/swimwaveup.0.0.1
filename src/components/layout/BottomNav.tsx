import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconType } from '../../../components/Icon';

interface BottomNavProps {
    unreadMessages?: number;
}

interface NavItemProps {
    to: string;
    icon: IconType;
    label: string;
    badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badgeCount }) => (
    <NavLink
        to={to}
        aria-label={label}
        className={({ isActive }) => `
            flex flex-col items-center justify-center w-full min-h-[56px] py-1 transition-colors duration-200 outline-none
            ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}
        `}
    >
        {({ isActive }) => (
            <>
                <div className="relative mb-1">
                    <Icon 
                        type={icon} 
                        className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} 
                    />
                    {badgeCount !== undefined && badgeCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white shadow-sm">
                            {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                    )}
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                    {label}
                </span>
            </>
        )}
    </NavLink>
);

const BottomNav: React.FC<BottomNavProps> = ({ unreadMessages = 0 }) => {
    return (
        <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-around items-end"
            style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
            aria-label="Menu di navigazione mobile"
            role="navigation"
        >
            <NavItem to="/" icon="home" label="Home" />
            <NavItem to="/jobs" icon="briefcase" label="Lavoro" />
            <NavItem to="/messages" icon="chat-bubble" label="Chat" badgeCount={unreadMessages} />
            <NavItem to="/network" icon="globe" label="Network" />
            <NavItem to="/profile" icon="user-circle" label="Profilo" />
        </nav>
    );
};

export default BottomNav;