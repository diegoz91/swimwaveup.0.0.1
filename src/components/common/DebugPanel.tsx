import React, { useState, useEffect } from 'react';
import { databases, account, storage } from '../../services/appwrite';
import { APPWRITE_CONFIG } from '../../utils/constants';
import { Query } from 'appwrite';

type Status = 'testing' | 'success' | 'failed' | 'logged_in' | 'not_logged_in';

interface DebugInfo {
  connection: Status;
  database: Status;
  collections: Record<string, Status>;
  buckets: Record<string, Status>;
  account: Status;
}

const AppwriteDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    connection: 'testing',
    database: 'testing',
    collections: {},
    buckets: {},
    account: 'testing'
  });

  useEffect(() => {
    if (isOpen && debugInfo.connection === 'testing') {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    console.log('🔍 Running SwimWaveUp Appwrite diagnostics...');
    setDebugInfo({ connection: 'testing', database: 'testing', collections: {}, buckets: {}, account: 'testing' });
    
    // Test 1: Connessione Base / Database
    try {
      await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.users, [Query.limit(1)]);
      setDebugInfo(prev => ({ ...prev, connection: 'success', database: 'success' }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, connection: 'failed', database: 'failed' }));
      console.error('❌ Connection/Database test failed:', error);
    }

    // Test 2: Collezioni
    const collectionTests: Record<string, Status> = {};
    for (const [name, id] of Object.entries(APPWRITE_CONFIG.collections)) {
      try {
        await databases.listDocuments(APPWRITE_CONFIG.databaseId, id, [Query.limit(1)]);
        collectionTests[name] = 'success';
      } catch (error) {
        collectionTests[name] = 'failed';
      }
    }
    setDebugInfo(prev => ({ ...prev, collections: collectionTests }));

    // Test 3: Storage
    const bucketTests: Record<string, Status> = {};
    for (const [name, id] of Object.entries(APPWRITE_CONFIG.buckets)) {
      try {
        await storage.listFiles(id, [Query.limit(1)]);
        bucketTests[name] = 'success';
      } catch (error) {
        bucketTests[name] = 'failed';
      }
    }
    setDebugInfo(prev => ({ ...prev, buckets: bucketTests }));

    // Test 4: Account (Sessione)
    try {
      await account.get();
      setDebugInfo(prev => ({ ...prev, account: 'logged_in' }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, account: 'not_logged_in' }));
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'success': case 'logged_in': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'not_logged_in': return 'text-amber-500';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'logged_in': return '👤';
      case 'not_logged_in': return '🚫';
      default: return '🔄';
    }
  };

  // Pannello per DEV
  if (import.meta.env.PROD || process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-[9999] flex flex-col items-start font-mono text-xs">
      
      {/* Bottone Toggle compatto */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-2 ${isOpen ? 'mb-2 opacity-50' : 'opacity-100 hover:scale-105'}`}
        title="Appwrite Debugger"
      >
        <span className={debugInfo.database === 'failed' ? 'animate-pulse text-red-400' : 'text-blue-400'}>
            ⚡ DEV
        </span>
      </button>

      {/* Pannello Espanso */}
      {isOpen && (
        <div className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl p-4 shadow-2xl w-72 max-h-[70vh] overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                <h4 className="font-bold text-white tracking-wider">APPWRITE STATUS</h4>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
                {/* Stato Generale */}
                <div>
                    <h5 className="text-slate-400 font-bold mb-1">CORE</h5>
                    <div className="flex justify-between">
                        <span>Database</span>
                        <span className={getStatusColor(debugInfo.database)}>{getStatusIcon(debugInfo.database)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Account</span>
                        <span className={getStatusColor(debugInfo.account)}>{getStatusIcon(debugInfo.account)}</span>
                    </div>
                </div>

                {/* Collezioni */}
                <div>
                    <h5 className="text-slate-400 font-bold mb-1">COLLECTIONS</h5>
                    {Object.entries(debugInfo.collections).length > 0 ? (
                        Object.entries(debugInfo.collections).map(([name, status]) => (
                            <div key={name} className="flex justify-between py-0.5">
                                <span className="truncate pr-2">{name}</span>
                                <span className={getStatusColor(status as Status)}>{getStatusIcon(status as Status)}</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-500 italic">In attesa...</span>
                    )}
                </div>

                {/* Storage */}
                <div>
                    <h5 className="text-slate-400 font-bold mb-1">STORAGE BUCKETS</h5>
                    {Object.entries(debugInfo.buckets).length > 0 ? (
                        Object.entries(debugInfo.buckets).map(([name, status]) => (
                            <div key={name} className="flex justify-between py-0.5">
                                <span className="truncate pr-2">{name}</span>
                                <span className={getStatusColor(status as Status)}>{getStatusIcon(status as Status)}</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-500 italic">In attesa...</span>
                    )}
                </div>
            </div>

            <button
                onClick={runDiagnostics}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors active:scale-95"
            >
                RERUN DIAGNOSTICS
            </button>
        </div>
      )}
    </div>
  );
};

export default AppwriteDebugger;