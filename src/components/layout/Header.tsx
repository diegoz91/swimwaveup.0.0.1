import React, { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const displayAvatar = useMemo(() => {
    if (!user) return '';
    if (user.userType === 'professional' && user.avatar) return user.avatar;
    if (user.userType === 'structure' && user.logo) return user.logo;
    const name = user.firstName || user.structureName || 'Utente';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8&bold=true&size=128`;
  }, [user]);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 z-50 h-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-2 sm:gap-3 transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg group">
          <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-tight">
            SwimWave<span className="text-blue-600">Up</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 font-semibold text-sm">
          {[
            { to: '/', label: 'Feed' },
            { to: '/jobs', label: 'Bacheca Lavoro' },
            { to: '/network', label: 'Il mio Network' },
            { to: '/messages', label: 'Messaggi' }
          ].map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'text-blue-600 bg-blue-50 shadow-inner' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4 md:pl-6 md:border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 sm:pr-4 rounded-full transition-all border border-transparent hover:border-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group">
                <div className="relative">
                  <img src={displayAvatar} alt="Profilo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-400 transition-all" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 leading-none max-w-[100px] truncate">{user.firstName || user.structureName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Visualizza profilo</span>
                </div>
              </Link>
              
              <button onClick={logout} className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-90" title="Esci da SwimIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pl-4">
              <Link to="/login" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all active:scale-95 text-sm">
                Accedi a SwimIn
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;