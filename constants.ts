import type { ProfessionalUser, MockJob, AquaticFacility, ConnectionRequest, Like, MockPost } from './types';

export const CURRENT_USER_ID = 1;

export const PROFESSIONALS: ProfessionalUser[] = [
    {
        id: 1, name: 'Mario Rossi', title: 'Istruttore di Nuoto', location: 'Milano, Italia', avatarUrl: 'https://i.pravatar.cc/150?u=mario',
        specializations: ['Nuoto per principianti', 'Aquagym'], experience: [{role: 'Istruttore', facility: 'Piscina Comunale', period: '2018-Presente', description: 'Lead instructor for adult and child swimming classes.'}],
        certifications: [{name: 'Istruttore Base', issuer: 'FIN', category: 'Teaching'}], connections: 150, bio: 'Passionate swimming instructor with over 5 years of experience.', email: 'mario.rossi@example.com', phone: '123-456-7890'
    },
    {
        id: 2, name: 'Giulia Bianchi', title: 'Allenatore Agonistico', location: 'Roma, Italia', avatarUrl: 'https://i.pravatar.cc/150?u=giulia',
        specializations: ['Stile libero', 'Dorso'], experience: [], certifications: [], connections: 250, bio: 'Head coach for a competitive swim team.', email: 'giulia.bianchi@example.com', phone: '123-456-7890'
    }
];

export const FACILITIES: AquaticFacility[] = [
    {
        id: 101, name: 'Piscina Olimpica Roma', type: 'Centro Sportivo', location: 'Roma, Italia', logoUrl: 'https://picsum.photos/seed/roma/200',
        services: [], features: [], openPositions: [], about: 'State-of-the-art facility.', images: ['https://picsum.photos/seed/img1/800/400', 'https://picsum.photos/seed/img2/400/400', 'https://picsum.photos/seed/img3/400/400']
    }
];

export const JOBS: MockJob[] = [
    {
        id: 1, title: 'Istruttore di Nuoto', facilityId: 101, facilityName: 'Piscina Olimpica Roma', facilityLogo: 'https://picsum.photos/seed/roma/200',
        location: 'Roma, Italia', type: 'Tempo Pieno', description: 'Cerchiamo un istruttore qualificato.', requirements: ['Brevetto FIN', 'Esperienza 2 anni'], salary: '€1,500 - €1,800', postedOn: '2 giorni fa'
    }
];

export const POSTS: MockPost[] = [{
    id: 1, authorId: 2, authorName: 'Giulia Bianchi', authorAvatar: 'https://i.pravatar.cc/150?u=giulia', authorTitle: 'Allenatore Agonistico',
    timestamp: '2h', content: 'Grande giornata di gare!', likes: 15, shares: 2, comments: [{id: 101, authorId: 1, content: 'Complimenti!', timestamp: '1h', likes: 2}]
}];

export const CONNECTION_REQUESTS: ConnectionRequest[] = [
    { id: 1, fromUserId: 2 }
];

export const LIKES: Like[] = [
    { postId: 1, userId: 1 }
];
