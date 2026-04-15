import dotenv from 'dotenv';
import { Client, Databases, Storage, Users } from 'node-appwrite';

dotenv.config({ path: '.env.setup' });

if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.error('❌ ERRORE: Mancano le credenziali nel file .env.setup');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);

const DB_ID = 'swimwaveup_db';
const BUCKETS = ['avatars', 'post_media'];

async function reset() {
    console.log('🧹 INIZIO RESET TOTALE DI SWIMWAVEUP...');

    try {
        await databases.delete(DB_ID);
        console.log(`✅ Database [${DB_ID}] disabilitato e rimosso.`);
    } catch (e) {
        if (e.code === 404) console.log(`⏩ Database [${DB_ID}] non trovato, salto.`);
        else console.error(`❌ Errore eliminazione DB:`, e.message);
    }

    for (const bucket of BUCKETS) {
        try {
            await storage.deleteBucket(bucket);
            console.log(`✅ Bucket Storage [${bucket}] svuotato e rimosso.`);
        } catch (e) {
            if (e.code === 404) console.log(`⏩ Bucket [${bucket}] non trovato, salto.`);
            else console.error(`❌ Errore eliminazione bucket ${bucket}:`, e.message);
        }
    }

    try {
        console.log('⏳ Ricerca utenti Auth da eliminare...');
        let allUsers = await users.list();
        
        if (allUsers.total === 0) {
            console.log('⏩ Nessun utente Auth trovato nel sistema.');
        } else {
            for (const user of allUsers.users) {
                await users.delete(user.$id);
                console.log(`   💀 Profilo Auth eliminato: ${user.email}`);
            }
            console.log(`✅ Tutti gli utenti (${allUsers.total}) sono stati disintegrati.`);
        }
    } catch (e) {
        console.error(`❌ Errore durante l'eliminazione degli utenti:`, e.message);
    }

    console.log('\n🎉 RESET COMPLETATO CON SUCCESSO! L\'ambiente è tornato vergine.');
    console.log('👉 Prossimo step: lancia "node setup-db.js" per ricostruire le fondamenta.');
}

reset().catch(console.error);