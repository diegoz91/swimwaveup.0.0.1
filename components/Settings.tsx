import React, { useState } from 'react';
import { Icon } from './Icon';
import type { AuthenticatedUser, View } from '../types';

interface SettingsProps {
  currentUser: AuthenticatedUser;
  onNavigate: (view: View, id?: string) => void;
  onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  currentUser, 
  onNavigate, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'about'>('account');
  
  const isProfessional = currentUser.userType === 'professional';

  const menuItems = [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'privacy', label: 'Privacy e Sicurezza', icon: 'building' },
    { id: 'notifications', label: 'Notifiche', icon: 'bell' },
    { id: 'about', label: 'Info App', icon: 'info' }
  ] as const;

  const displayName = isProfessional 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Utente'
    : currentUser.structureName || 'Struttura';
    
  const displayAvatar = (isProfessional ? currentUser.avatar : currentUser.logo) || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=1d4ed8`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-20 md:pb-8">
      {/* Header Mobile/Desktop */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Torna alla Dashboard"
            >
              <Icon type="x" className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-extrabold text-slate-800">Impostazioni</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Menu Laterale */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-36">
              <nav className="p-2 sm:p-3 flex flex-row lg:flex-col overflow-x-auto custom-scrollbar hide-scrollbar-mobile">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 lg:flex-shrink w-auto lg:w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all font-semibold ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon type={item.icon as any} className={`w-5 h-5 ${activeTab === item.id ? 'fill-current opacity-20' : ''}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenuto Principale */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 min-h-[400px]">
              
              {/* Tab Account */}
              {activeTab === 'account' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-6">Informazioni Account</h2>
                  
                  {/* Info Utente */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 flex items-center space-x-5">
                      <img
                        src={displayAvatar}
                        alt="Il tuo avatar"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                          {displayName}
                        </h3>
                        <p className="text-slate-500 text-sm sm:text-base truncate">{currentUser.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
                          {isProfessional ? 'Professionista' : 'Struttura Sportiva'}
                        </span>
                      </div>
                  </div>

                  {/* Pulsanti azioni account */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => onNavigate('profile', currentUser.$id)}
                      className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Icon type="user" className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-blue-700">Modifica Profilo Pubblico</span>
                      </div>
                      <span className="text-slate-400 group-hover:text-blue-600 font-bold">&rarr;</span>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors opacity-60 cursor-not-allowed" title="Disponibile a breve">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                            <Icon type="certificate" className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="font-bold text-slate-700">Modifica Password</span>
                      </div>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-semibold">Presto</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Privacy */}
              {activeTab === 'privacy' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-6">Privacy e Sicurezza</h2>
                  <div className="space-y-1">
                    {/* Toggles (Visuali) */}
                    {[
                        { title: "Profilo Pubblico", desc: "Il tuo profilo è visibile agli altri iscritti sulla piattaforma" },
                        { title: "Messaggi da Sconosciuti", desc: "Permetti a chiunque di inviarti messaggi, anche se non connessi" },
                        { title: "Motori di Ricerca", desc: "Permetti a Google di indicizzare il tuo profilo" }
                    ].map((setting, idx) => (
                        <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                            <div className="pr-4">
                                <h3 className="font-bold text-slate-800">{setting.title}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{setting.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input type="checkbox" defaultChecked={idx !== 1} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Notifiche */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-6">Notifiche</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Email</h3>
                      <div className="space-y-1 bg-slate-50 rounded-xl border border-slate-100 p-2">
                        {['Nuovi messaggi', 'Nuove richieste di connessione', 'Nuove opportunità di lavoro'].map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors">
                                <span className="font-medium text-slate-700">{item}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked={idx !== 2} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Info App */}
              {activeTab === 'about' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-6">Informazioni</h2>
                  
                  <div className="text-center py-6 border-b border-slate-100 mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                        <Icon type="home" className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                        SwimWave<span className="text-blue-600">Up</span>
                    </h3>
                    <p className="text-slate-500 font-medium">Versione 1.0.0-rc (Production)</p>
                  </div>

                  <div className="space-y-2">
                    {['Termini di Servizio', 'Privacy Policy', 'Supporto Tecnico'].map((item, idx) => (
                        <button key={idx} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left group">
                            <span className="font-bold text-slate-700">{item}</span>
                            <span className="text-slate-400 group-hover:text-slate-600 font-bold">&rarr;</span>
                        </button>
                    ))}
                  </div>

                  {onLogout && (
                    <div className="pt-8 mt-8 border-t border-slate-100">
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                      >
                        <Icon type="logout" className="w-5 h-5" />
                        <span>Esci dall'Account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};