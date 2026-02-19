import { useEffect } from 'react';
import { databases } from './src/services/appwrite';
import { APPWRITE_CONFIG } from './src/utils/constants';

const App = () => {
  useEffect(() => {
    const testAppwrite = async () => {
      try {
        console.log('🧪 Testing Appwrite...');
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users
        );
        console.log('✅ Appwrite working!', response);
      } catch (error) {
        console.error('❌ Appwrite error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          type: error.type
        });
      }
    };
    testAppwrite();
  }, []);

  return <div>TEST</div>;
};