// src/services/appwrite.ts
import { Client, Account, Databases, Storage, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';

console.log('🏊‍♂️ Initializing SwimWaveUp Appwrite...');

// Configure Appwrite client for SwimWaveUp
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);


// Immediate connection test
const testConnection = async () => {
  try {
    console.log('🧪 Testing Appwrite connection...');
    const health = await fetch(`${APPWRITE_CONFIG.endpoint}/health`);
    if (health.ok) {
      console.log('✅ Appwrite endpoint reachable');
    }
    
    // Test database access
    const dbTest = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.users,
      [Query.limit(1)]
    );
    console.log('✅ Database connection successful');
    
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error);
    console.error('🔍 Check:', {
      projectId: APPWRITE_CONFIG.projectId,
      databaseId: APPWRITE_CONFIG.databaseId,
      endpoint: APPWRITE_CONFIG.endpoint
    });
  }
};

// Run test only in development
if (process.env.NODE_ENV === 'development') {
  // testConnection(); // Temporarily disable to avoid console noise on every load
}

export { client };