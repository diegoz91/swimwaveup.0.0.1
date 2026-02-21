import { Client, Account, Databases, Storage, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';

console.log('🏊‍♂️ Initializing SwimWaveUp Appwrite...');

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const testConnection = async () => {
  try {
    console.log('🧪 Testing Appwrite connection...');
    
    const health = await fetch(`${APPWRITE_CONFIG.endpoint}/health`);
    if (health.ok) {
      console.log('✅ Appwrite endpoint reachable');
    }
    
    await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.users,
      [Query.limit(1)]
    );
    console.log('✅ Database connection successful');
    
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error);
    console.error('🔍 Info Debug:', {
      projectId: APPWRITE_CONFIG.projectId,
      databaseId: APPWRITE_CONFIG.databaseId,
    });
  }
};

if (import.meta.env.DEV) {
  // Test per la connessione ad ogni salvataggio del file
  //testConnection(); 
}

export { client };