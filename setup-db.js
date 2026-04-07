import dotenv from 'dotenv';
import { Client, Databases, Storage } from 'node-appwrite';

dotenv.config({ path: '.env.setup' });

if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.error('❌ ERRORE: Mancano le credenziali nel file .env.setup (APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY)');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = 'swimwaveup_db';

const schema = {
    collections: [
        {
            id: 'profiles', name: 'Profiles',
            attributes: [
                { key: 'userId', type: 'string', size: 36, required: true },
                { key: 'userType', type: 'string', size: 50, required: true },
                { key: 'email', type: 'string', size: 255, required: true },
                { key: 'firstName', type: 'string', size: 255, required: false },
                { key: 'lastName', type: 'string', size: 255, required: false },
                { key: 'structureName', type: 'string', size: 255, required: false },
                { key: 'title', type: 'string', size: 255, required: false },
                { key: 'structureType', type: 'string', size: 255, required: false },
                { key: 'bio', type: 'string', size: 2500, required: false },
                { key: 'avatar', type: 'string', size: 2048, required: false },
                { key: 'logo', type: 'string', size: 2048, required: false },
                { key: 'city', type: 'string', size: 255, required: false },
                { key: 'province', type: 'string', size: 10, required: false },
                { key: 'typingTo', type: 'string', size: 36, required: false },
                { key: 'readReceipts', type: 'boolean', required: false, default: true },
                { key: 'experienceList', type: 'string', size: 2500, required: false, array: true },
                { key: 'certificationsList', type: 'string', size: 2500, required: false, array: true },
                { key: 'connections', type: 'string', size: 36, required: false, array: true }
            ]
        },
        {
            id: 'posts', name: 'Posts',
            attributes: [
                { key: 'authorId', type: 'string', size: 36, required: true },
                { key: 'authorType', type: 'string', size: 50, required: true },
                { key: 'content', type: 'string', size: 4000, required: true },
                { key: 'postType', type: 'string', size: 50, required: true },
                { key: 'visibility', type: 'string', size: 50, required: true },
                { key: 'likesCount', type: 'integer', required: false, default: 0 },
                { key: 'commentsCount', type: 'integer', required: false, default: 0 }
            ]
        },
        {
            id: 'comments', name: 'Comments',
            attributes: [
                { key: 'postId', type: 'string', size: 36, required: true },
                { key: 'authorId', type: 'string', size: 36, required: true },
                { key: 'content', type: 'string', size: 2000, required: true },
                { key: 'parentCommentId', type: 'string', size: 36, required: false }
            ]
        },
        {
            id: 'likes', name: 'Likes',
            attributes: [
                { key: 'postId', type: 'string', size: 36, required: true },
                { key: 'userId', type: 'string', size: 36, required: true }
            ]
        },
        {
            id: 'jobs', name: 'Jobs',
            attributes: [
                { key: 'structureId', type: 'string', size: 36, required: true },
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 2500, required: true },
                { key: 'role', type: 'string', size: 100, required: true },
                { key: 'contractType', type: 'string', size: 100, required: false },
                { key: 'city', type: 'string', size: 255, required: true },
                { key: 'province', type: 'string', size: 10, required: false },
                { key: 'salaryMin', type: 'integer', required: false },
                { key: 'salaryMax', type: 'integer', required: false },
                { key: 'isActive', type: 'boolean', required: false, default: true },
                { key: 'requirements', type: 'string', size: 2500, required: false },
                { key: 'qualifications', type: 'string', size: 2500, required: false }
            ]
        },
        {
            id: 'applications', name: 'Applications',
            attributes: [
                { key: 'jobId', type: 'string', size: 36, required: true },
                { key: 'applicantId', type: 'string', size: 36, required: true },
                { key: 'status', type: 'string', size: 50, required: true },
                { key: 'coverLetter', type: 'string', size: 3000, required: false }
            ]
        },
        {
            id: 'connections', name: 'Connections',
            attributes: [
                { key: 'senderId', type: 'string', size: 36, required: true },
                { key: 'receiverId', type: 'string', size: 36, required: true },
                { key: 'status', type: 'string', size: 50, required: true }
            ]
        },
        {
            id: 'messages', name: 'Messages',
            attributes: [
                { key: 'conversationId', type: 'string', size: 100, required: true },
                { key: 'senderId', type: 'string', size: 36, required: true },
                { key: 'receiverId', type: 'string', size: 36, required: true },
                { key: 'content', type: 'string', size: 4000, required: true },
                { key: 'isRead', type: 'boolean', required: false, default: false }
            ]
        }
    ],
    buckets: [
        { id: 'avatars', name: 'Avatars' },
        { id: 'post_media', name: 'Post Media' }
    ]
};

async function setup() {
    console.log('🚀 Avvio configurazione Appwrite per SwimWaveUp...');
    
    // 1. Crea Database
    try {
        await databases.create(DB_ID, 'SwimWaveUp DB');
        console.log('✅ Database creato con successo');
    } catch (e) {
        if (e.code === 409) console.log('⏩ Database già esistente');
        else throw e;
    }

    // 2. Crea Collections & Attributi
    for (const col of schema.collections) {
        try {
            await databases.createCollection(DB_ID, col.id, col.name);
            console.log(`\n✅ Collezione creata: ${col.name}`);
        } catch (e) {
            if (e.code === 409) console.log(`\n⏩ Collezione ${col.name} già esistente`);
            else throw e;
        }

        for (const attr of col.attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, col.id, attr.key, attr.size, attr.required, undefined, attr.array || false);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(DB_ID, col.id, attr.key, attr.required, 0, 1000000, attr.default, attr.array || false);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DB_ID, col.id, attr.key, attr.required, attr.default, attr.array || false);
                }
                console.log(`   🔸 Attributo creato/verificato: ${attr.key}`);
            } catch (e) {
                if (e.code !== 409) console.error(`   ❌ Errore attributo ${attr.key}:`, e.message);
            }
        }
    }

    // 3. Crea Storage Buckets
    console.log('\n🗂️ Creazione Storage Buckets...');
    for (const bucket of schema.buckets) {
        try {
            await storage.createBucket(bucket.id, bucket.name, [], false, false, undefined, ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov']);
            console.log(`   ✅ Bucket creato: ${bucket.name}`);
        } catch (e) {
            if (e.code === 409) console.log(`   ⏩ Bucket ${bucket.name} già esistente.`);
            else console.error(`   ❌ Errore bucket ${bucket.name}:`, e.message);
        }
    }

    console.log('\n🎉 SETUP COMPLETATO! Il backend è pronto per la produzione.');
}

setup().catch(console.error);