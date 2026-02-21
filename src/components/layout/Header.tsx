import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getDisplayAvatar = () => {
    if (!user) return '';
    if (user.userType === 'professional' && user.avatar) return user.avatar;
    if (user.userType === 'structure' && user.logo) return user.logo;
    
    const name = user.firstName || user.structureName || 'Utente';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 z-50 px-4 sm:px-6 flex justify-between items-center h-16 transition-all">
      
      {/* Logo */}
      <Link 
        to="/" 
        className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        aria-label="Torna alla Home"
      >
        <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-tight">
          SwimWave<span className="text-blue-600">Up</span>
        </span>
      </Link>

      {/* Navigazione Desktop */}
      <nav className="hidden md:flex items-center gap-8 font-medium text-sm" aria-label="Navigazione principale">
        <NavLink 
          to="/" 
          className={({ isActive }) => `transition-colors duration-200 py-2 border-b-2 ${isActive ? 'text-blue-600 border-blue-600 font-bold' : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-200'}`}
        >
          Feed
        </NavLink>
        <NavLink 
          to="/jobs" 
          className={({ isActive }) => `transition-colors duration-200 py-2 border-b-2 ${isActive ? 'text-blue-600 border-blue-600 font-bold' : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-200'}`}
        >
          Bacheca Lavoro
        </NavLink>
        <NavLink 
          to="/network" 
          className={({ isActive }) => `transition-colors duration-200 py-2 border-b-2 ${isActive ? 'text-blue-600 border-blue-600 font-bold' : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-200'}`}
        >
          Network
        </NavLink>
      </nav>

      {/* Area Utente */}
      <div className="flex items-center">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4 md:pl-6 md:border-l border-slate-200">
            {/* Profilo Cliccabile */}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 sm:pr-4 rounded-full transition-colors border border-transparent hover:border-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Vai al tuo profilo"
            >
              <img 
                src={getDisplayAvatar()} 
                alt={`Avatar di ${user.firstName || user.structureName || 'Utente'}`} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm bg-slate-100"
                loading="lazy"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                }}
              />
              <span className="text-sm font-bold text-slate-700 hidden sm:block max-w-[120px] truncate">
                {user.firstName || user.structureName || 'Profilo'}
              </span>
            </Link>
            
            {/* Tasto Logout */}
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              title="Esci dall'account"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2 pl-4 md:border-l border-slate-200">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white font-bold px-5 py-2 rounded-full hover:bg-blue-700 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm active:scale-95 text-sm"
            >
              Accedi
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;