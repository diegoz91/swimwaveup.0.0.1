import React, { useState } from 'react';
import { Icon } from './Icon';
import type { AuthenticatedUser, View } from '../types';

interface SettingsProps {
  currentUser: AuthenticatedUser;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  currentUser, 
  onNavigate, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'about'>('account');
  
  const isProfessional = currentUser.userType === 'professional';

  // Sezioni del menu laterale
  const menuItems = [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'privacy', label: 'Privacy', icon: 'shield' },
    { id: 'notifications', label: 'Notifiche', icon: 'bell' },
    { id: 'about', label: 'Info App', icon: 'info' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Icon type="arrow-left" className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Menu laterale */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon type={item.icon as any} className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenuto principale */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              
              {/* Tab Account */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informazioni Account</h2>
                  
                  {/* Info utente */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={
                          isProfessional 
                            ? currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName + ' ' + currentUser.lastName)}&background=3b82f6&color=fff`
                            : currentUser.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.structureName)}&background=3b82f6&color=fff`
                        }
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isProfessional 
                            ? `${currentUser.firstName} ${currentUser.lastName}`
                            : currentUser.structureName
                          }
                        </h3>
                        <p className="text-gray-500">{currentUser.email}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {isProfessional ? 'Professionista' : 'Struttura'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti azioni account */}
                  <div className="space-y-4">
                    <button 
                      onClick={() => onNavigate('profile', currentUser.$id)}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon type="edit" className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Modifica Profilo</span>
                      </div>
                      <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Icon type="key" className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Cambia Password</span>
                      </div>
                      <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Privacy */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy e Sicurezza</h2>
                  
                  <div className="space-y-6">
                    {/* Visibilità profilo */}
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">Profilo Pubblico</h3>
                        <p className="text-sm text-gray-500">Il tuo profilo è visibile agli altri utenti</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Messaggi da sconosciuti */}
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">Messaggi da Sconosciuti</h3>
                        <p className="text-sm text-gray-500">Permetti messaggi da utenti non connessi</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Indicizzazione motori di ricerca */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-gray-900">Indicizzazione Motori di Ricerca</h3>
                        <p className="text-sm text-gray-500">Permetti ai motori di ricerca di indicizzare il tuo profilo</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Notifiche */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifiche</h2>
                  
                  <div className="space-y-6">
                    {/* Notifiche Email */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Notifiche Email</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Nuovi messaggi</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Nuove connessioni</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Nuove opportunità di lavoro</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notifiche Push */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Notifiche Push</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Attività sui tuoi post</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Commenti sui tuoi post</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Info App */}
              {activeTab === 'about' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informazioni App</h2>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c-1.3-.54-2.2-1.79-2.2-3.21 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.42-.9 2.67-2.2 3.21C16.53 12.44 18 14.54 18 17h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c0-2.46 1.47-4.56 3.8-5.21z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">SwimWaveUp</h3>
                      <p className="text-gray-500 mb-4">Versione 1.0.0</p>
                    </div>

                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900">Termini di Servizio</span>
                        <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900">Privacy Policy</span>
                        <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900">Supporto</span>
                        <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900">Segnala un Problema</span>
                        <Icon type="chevron-right" className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Pulsante Logout */}
                    {onLogout && (
                      <div className="pt-6 border-t">
                        <button 
                          onClick={onLogout}
                          className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          <Icon type="logout" className="w-5 h-5" />
                          <span>Esci dall'App</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};