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

const AppwriteDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    connection: 'testing',
    database: 'testing',
    collections: {},
    buckets: {},
    account: 'testing'
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    console.log('🔍 Running SwimWaveUp Appwrite diagnostics...');
    setDebugInfo({ connection: 'testing', database: 'testing', collections: {}, buckets: {}, account: 'testing' });
    
    // Test 1: Basic connection
    try {
      await fetch(`${APPWRITE_CONFIG.endpoint}/health`);
      setDebugInfo(prev => ({ ...prev, connection: 'success' }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, connection: 'failed' }));
      console.error('❌ Connection test failed:', error);
    }

    // Test 2: Database access
    try {
      // Test by listing documents from a known collection
      await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.users, [Query.limit(1)]);
      setDebugInfo(prev => ({ ...prev, database: 'success' }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, database: 'failed' }));
      console.error('❌ Database test failed:', error);
    }

    // Test 3: Collections
    const collectionTests: Record<string, Status> = {};
    for (const [name, id] of Object.entries(APPWRITE_CONFIG.collections)) {
      try {
        await databases.listDocuments(APPWRITE_CONFIG.databaseId, id, [Query.limit(1)]);
        collectionTests[name] = 'success';
      } catch (error) {
        collectionTests[name] = 'failed';
        console.error(`❌ Collection ${name} failed:`, error);
      }
    }
    setDebugInfo(prev => ({ ...prev, collections: collectionTests }));

    // Test 4: Storage buckets
    const bucketTests: Record<string, Status> = {};
    for (const [name, id] of Object.entries(APPWRITE_CONFIG.buckets)) {
      try {
        await storage.listFiles(id);
        bucketTests[name] = 'success';
      } catch (error) {
        bucketTests[name] = 'failed';
        console.error(`❌ Bucket ${name} failed:`, error);
      }
    }
    setDebugInfo(prev => ({ ...prev, buckets: bucketTests }));

    // Test 5: Account (if logged in)
    try {
      await account.get();
      setDebugInfo(prev => ({ ...prev, account: 'logged_in' }));
    } catch (error) {
      setDebugInfo(prev => ({ ...prev, account: 'not_logged_in' }));
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'success': case 'logged_in': return '#2ed573';
      case 'failed': return '#ff4757';
      case 'not_logged_in': return '#ffa502';
      default: return '#70a1ff';
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

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '300px',
      background: 'white', border: '2px solid #0066cc', borderRadius: '12px',
      padding: '16px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,102,204,0.15)',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>
        🏊‍♂️ SwimWaveUp Appwrite Status
      </h4>
      {Object.entries(debugInfo.collections).map(([name, status]) => (
            <div key={name}>
              <span style={{ color: getStatusColor(status) }}>
                {getStatusIcon(status)} {name}
              </span>
            </div>
          ))}
          <strong>🗂️ Storage:</strong>
          {Object.entries(debugInfo.buckets).map(([name, status]) => (
            <div key={name}>
              <span style={{ color: getStatusColor(status) }}>
                {getStatusIcon(status)} {name}
              </span>
            </div>
          ))}
           <strong>👤 Account:</strong> 
        <span style={{ color: getStatusColor(debugInfo.account), marginLeft: '8px' }}>
          {getStatusIcon(debugInfo.account)} {debugInfo.account}
        </span>
      <button
        onClick={runDiagnostics}
        style={{
          width: '100%', padding: '8px', background: '#0066cc',
          color: 'white', border: 'none', borderRadius: '6px',
          cursor: 'pointer', fontSize: '11px', marginTop: '12px'
        }}
      >
        🔄 Rerun Test
      </button>
    </div>
  );
};

export default AppwriteDebugger;