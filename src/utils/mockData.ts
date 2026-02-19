// src/utils/mockData.ts
import type { ProfessionalUser, MockJob, AquaticFacility, ConnectionRequest, Like, MockPost, MockApplication, Conversation } from '../../types';

export const CURRENT_USER_ID = 1;

export const PROFESSIONALS: ProfessionalUser[] = [
    {
        id: 1, name: 'Mario Rossi', title: 'Istruttore di Nuoto', location: 'Milano, Italia', avatarUrl: 'https://i.pravatar.cc/150?u=mario',
        specializations: ['Nuoto per principianti', 'Aquagym'], 
        experience: [{role: 'Istruttore', facility: 'Piscina Comunale', period: '2018-Presente', description: 'Lead instructor for adult and child swimming classes.'}],
        certifications: [{name: 'Istruttore Base', issuer: 'FIN', category: 'Teaching'}], 
        connections: 150, 
        bio: 'Passionate swimming instructor with over 5 years of experience.', 
        email: 'mario.rossi@example.com', 
        phone: '123-456-7890'
    },
    {
        id: 2, name: 'Giulia Bianchi', title: 'Allenatore Agonistico', location: 'Roma, Italia', avatarUrl: 'https://i.pravatar.cc/150?u=giulia',
        specializations: ['Stile libero', 'Dorso'], 
        experience: [{role: 'Head Coach', facility: 'Roma Nuoto', period: '2015-Presente', description: 'Coaching competitive swimmers for national championships.'}], 
        certifications: [{name: 'Allenatore 2° Livello', issuer: 'FIN', category: 'Coaching'}], 
        connections: 250, 
        bio: 'Head coach for a competitive swim team.', 
        email: 'giulia.bianchi@example.com', 
        phone: '123-456-7890'
    }
];

export const FACILITIES: AquaticFacility[] = [
    {
        id: 101, name: 'Piscina Olimpica Roma', type: 'Centro Sportivo', location: 'Roma, Italia', logoUrl: 'https://picsum.photos/seed/roma/200',
        services: ['Corsi nuoto', 'Nuoto libero', 'Acquagym'], 
        features: ['Vasca 50m', 'Palestra', 'Parcheggio'], 
        openPositions: [], 
        about: 'State-of-the-art facility for both amateurs and professionals.', 
        images: ['https://picsum.photos/seed/img1/800/400', 'https://picsum.photos/seed/img2/400/400', 'https://picsum.photos/seed/img3/400/400']
    }
];

export const JOBS: MockJob[] = [
    {
        id: 1, title: 'Istruttore di Nuoto', facilityId: 101, facilityName: 'Piscina Olimpica Roma', facilityLogo: 'https://picsum.photos/seed/roma/200',
        location: 'Roma, Italia', type: 'Tempo Pieno', description: 'Cerchiamo un istruttore qualificato per i nostri corsi per bambini e adulti.', 
        requirements: ['Brevetto FIN Istruttore', 'Esperienza minima 2 anni', 'Certificazione BLSD'], 
        salary: '€1,500 - €1,800 / mese', postedOn: '2 giorni fa'
    },
    {
        id: 2, title: 'Bagnino', facilityId: 101, facilityName: 'Piscina Olimpica Roma', facilityLogo: 'https://picsum.photos/seed/roma/200',
        location: 'Roma, Italia', type: 'Stagionale', description: 'Responsabile della sicurezza in vasca durante gli orari di apertura al pubblico.', 
        requirements: ['Patentino Salvamento', 'Primo soccorso'], 
        salary: '€1,200 / mese', postedOn: '5 giorni fa'
    }
];

export const POSTS: MockPost[] = [{
    id: 1, authorId: 2, authorName: 'Giulia Bianchi', authorAvatar: 'https://i.pravatar.cc/150?u=giulia', authorTitle: 'Allenatore Agonistico',
    timestamp: '2h', content: 'Grande giornata di gare oggi! Fiero dei miei ragazzi che hanno dato il massimo. Ogni bracciata, ogni respiro, ogni virata era piena di determinazione. Avanti tutta verso i nazionali! 🏊‍♂️🏆 #nuoto #agonismo #swimlife', 
    likes: 15, shares: 2, 
    comments: [{id: 101, authorId: 1, content: 'Complimenti a tutto il team!', timestamp: '1h', likes: 2}]
},
{
    id: 2, authorId: 1, authorName: 'Mario Rossi', authorAvatar: 'https://i.pravatar.cc/150?u=mario', authorTitle: 'Istruttore di Nuoto',
    timestamp: '1d', content: 'Lezione di acquaticità neonatale questa mattina. È meraviglioso vedere i più piccoli prendere confidenza con l\'acqua. Un sorriso alla volta! 👶💧 #acquaticità #nuotoneonati',
    media: [{ type: 'image', url: 'https://picsum.photos/seed/neonati/800/600' }],
    likes: 42, shares: 8, 
    comments: [{id: 102, authorId: 2, content: 'Bellissimo lavoro, Mario!', timestamp: '22h', likes: 4}]
}];

export const CONNECTION_REQUESTS: ConnectionRequest[] = [
    { id: 1, fromUserId: 2 }
];

export const LIKES: Like[] = [
    { postId: 1, userId: 1 }
];

export const MY_APPLICATIONS: MockApplication[] = [
    { id: 1, jobId: 1, userId: 1, status: 'in revisione', submittedOn: '1 giorno fa', type: 'rapida' },
    { id: 2, jobId: 2, userId: 1, status: 'inviata', submittedOn: '3 giorni fa', type: 'personalizzata' },
];