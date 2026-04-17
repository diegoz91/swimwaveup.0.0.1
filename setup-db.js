import dotenv from 'dotenv';
import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
                { key: 'connections', type: 'string', size: 36, required: false, array: true },
                { key: 'isOnline', type: 'boolean', required: false, default: false },
                { key: 'lastActive', type: 'string', size: 100, required: false },
                { key: 'availableForEmergencies', type: 'boolean', required: false, default: false },
                { key: 'managedFacilities', type: 'string', size: 36, required: false, array: true }
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
                { key: 'category', type: 'string', size: 100, required: false },
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
                { key: 'description', type: 'string', size: 4000, required: true },
                { key: 'role', type: 'string', size: 100, required: true },
                { key: 'contractType', type: 'string', size: 100, required: false },
                { key: 'city', type: 'string', size: 255, required: true },
                { key: 'province', type: 'string', size: 10, required: false },
                { key: 'salaryMin', type: 'integer', required: false },
                { key: 'salaryMax', type: 'integer', required: false },
                { key: 'workingHours', type: 'string', size: 255, required: false },
                { key: 'isActive', type: 'boolean', required: false, default: true },
                { key: 'structureName', type: 'string', size: 255, required: false },
                { key: 'facilityLogo', type: 'string', size: 2048, required: false },
                { key: 'candidates', type: 'string', size: 36, required: false, array: true },
                { key: 'requirements', type: 'string', size: 500, required: false, array: true },
                { key: 'qualificationsRequired', type: 'string', size: 500, required: false, array: true },
                { key: 'isSOS', type: 'boolean', required: false, default: false },
                { key: 'sosDate', type: 'string', size: 100, required: false },
                { key: 'sosShift', type: 'string', size: 100, required: false }
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
        },
        {
            id: 'announcements', name: 'Announcements',
            attributes: [
                { key: 'structureId', type: 'string', size: 36, required: true },
                { key: 'content', type: 'string', size: 4000, required: true },
                { key: 'isImportant', type: 'boolean', required: false, default: false },
                { key: 'readBy', type: 'string', size: 36, required: false, array: true }
            ]
        },
        {
            id: 'shifts', name: 'Shifts',
            attributes: [
                { key: 'structureId', type: 'string', size: 36, required: true },
                { key: 'userId', type: 'string', size: 36, required: true },
                { key: 'userName', type: 'string', size: 255, required: true },
                { key: 'date', type: 'string', size: 100, required: true },
                { key: 'shiftTime', type: 'string', size: 100, required: true },
                { key: 'role', type: 'string', size: 100, required: true },
                { key: 'status', type: 'string', size: 50, required: true } 
            ]
        },
        {
            id: 'facilities', name: 'Facilities',
            attributes: [
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'type', type: 'string', size: 255, required: false },
                { key: 'city', type: 'string', size: 255, required: true },
                { key: 'province', type: 'string', size: 10, required: false },
                { key: 'bio', type: 'string', size: 2500, required: false },
                { key: 'logo', type: 'string', size: 2048, required: false },
                { key: 'cover', type: 'string', size: 2048, required: false },
                { key: 'admins', type: 'string', size: 36, required: false, array: true },
                { key: 'staff', type: 'string', size: 36, required: false, array: true },
                { key: 'followers', type: 'string', size: 36, required: false, array: true }
            ]
        },
        {
            id: 'notifications', name: 'Notifications',
            attributes: [
                { key: 'userId', type: 'string', size: 36, required: true },
                { key: 'type', type: 'string', size: 50, required: true },
                { key: 'content', type: 'string', size: 255, required: true },
                { key: 'relatedId', type: 'string', size: 36, required: false },
                { key: 'isRead', type: 'boolean', required: false, default: false }
            ]
        },
        {
            id: 'live_rooms', name: 'Live Rooms',
            attributes: [
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 1000, required: false },
                { key: 'hostId', type: 'string', size: 36, required: true },
                { key: 'facilityId', type: 'string', size: 36, required: false },
                { key: 'status', type: 'string', size: 50, required: true },
                { key: 'speakers', type: 'string', size: 36, required: false, array: true },
                { key: 'listeners', type: 'string', size: 36, required: false, array: true },
                { key: 'startedAt', type: 'string', size: 100, required: true }
            ]
        },
        {
            id: 'swim_meets', name: 'Swim Meets',
            attributes: [
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 4000, required: true },
                { key: 'date', type: 'string', size: 100, required: true },
                { key: 'time', type: 'string', size: 100, required: true },
                { key: 'city', type: 'string', size: 255, required: true },
                { key: 'address', type: 'string', size: 500, required: false },
                { key: 'creatorId', type: 'string', size: 36, required: true },
                { key: 'participants', type: 'string', size: 36, required: false, array: true },
                { key: 'maxParticipants', type: 'integer', required: false },
                { key: 'status', type: 'string', size: 50, required: true }
            ]
        }
    ],
    buckets: [
        { id: 'avatars', name: 'Avatars' },
        { id: 'post_media', name: 'Post Media' }
    ]
};

const defaultPermissions = [
    Permission.read(Role.any()), 
    Permission.create(Role.users()), 
    Permission.update(Role.users()), 
    Permission.delete(Role.users())  
];

async function setup() {
    console.log('🚀 Avvio configurazione Appwrite...');
    
    try {
        await databases.create(DB_ID, 'SwimWaveUp DB');
        console.log('✅ Database creato con successo');
        await sleep(1000);
    } catch (e) {
        if (e.code === 409) console.log('⏩ Database già esistente');
        else throw e;
    }

    for (const col of schema.collections) {
        let isNewCollection = false;
        try {
            await databases.createCollection(DB_ID, col.id, col.name, defaultPermissions);
            console.log(`\n✅ Collezione creata e sbloccata: ${col.name}`);
            isNewCollection = true;
            await sleep(1500); 
        } catch (e) {
            if (e.code === 409) {
                console.log(`\n⏩ Collezione ${col.name} già esistente. Forzo lo sblocco permessi...`);
                try {
                    await databases.updateCollection(DB_ID, col.id, col.name, defaultPermissions);
                    console.log(`   🔓 Permessi aggiornati con successo per ${col.name}!`);
                } catch(err) {
                    console.error(`   ⚠️ Attenzione: Impossibile forzare i permessi su ${col.name}.`);
                }
            } else throw e;
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
                console.log(`   🔸 Attributo verificato: ${attr.key}`);
            } catch (e) {
                if (e.code === 409 || (e.message && e.message.includes('maximum number or size'))) {
                } else {
                    console.error(`   ❌ Errore attributo ${attr.key}:`, e.message);
                }
            }
            if(isNewCollection) await sleep(200); 
        }
    }

    console.log('\n🗂️ Sblocco Storage Buckets...');
    for (const bucket of schema.buckets) {
        try {
            await storage.createBucket(bucket.id, bucket.name, defaultPermissions, false, false, undefined, ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov']);
            console.log(`   ✅ Bucket creato e sbloccato: ${bucket.name}`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`   ⏩ Bucket ${bucket.name} esistente. Sblocco permessi...`);
                try {
                    await storage.updateBucket(bucket.id, bucket.name, defaultPermissions);
                } catch(err){}
            } else console.error(`   ❌ Errore bucket ${bucket.name}:`, e.message);
        }
    }

    console.log('\n🎉 SETUP COMPLETATO!');
}

setup().catch(console.error);