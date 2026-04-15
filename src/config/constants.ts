if (!import.meta.env.VITE_APPWRITE_ENDPOINT || !import.meta.env.VITE_APPWRITE_PROJECT_ID) {
    throw new Error(
        "🔥 ERRORE CRITICO DI BUILD: Variabili d'ambiente di Appwrite mancanti. " +
        "Assicurati che VITE_APPWRITE_ENDPOINT e VITE_APPWRITE_PROJECT_ID siano configurati nel file .env."
    );
}

export interface AppwriteConfig {
    endpoint: string;
    projectId: string;
    databaseId: string;
    collections: {
        profiles: string;
        posts: string;
        comments: string;
        likes: string;
        jobs: string;
        applications: string;
        connections: string;
        messages: string;
        announcements?: string;
        shifts?: string;
        facilities?: string;
        notifications?: string;
    };
    buckets: {
        avatars: string;
        postMedia: string;
    };
}

export const APPWRITE_CONFIG: AppwriteConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: 'swimwaveup_db',
    collections: {
        profiles: 'profiles',
        posts: 'posts',
        comments: 'comments',
        likes: 'likes',
        jobs: 'jobs',
        applications: 'applications',
        connections: 'connections',
        messages: 'messages',
        announcements: 'announcements', 
        shifts: 'shifts',
        facilities: 'facilities',
        notifications: 'notifications'
    },
    buckets: {
        avatars: 'avatars',
        postMedia: 'post_media',
    }
};

export const APP_CONFIG = {
    name: 'SwimIn',
    fullName: 'SwimWaveUP - SwimIn',
    version: '1.0.0',
    environment: import.meta.env.MODE,
};