import { ID, Query } from 'appwrite';
import { databases } from '@/services/appwrite';
import { APPWRITE_CONFIG } from '@/config/constants';
import type { 
    UserProfile, 
    StructureProfile, 
    Post, 
    Job, 
    Application, 
    Connection,
    Like,
    Comment,
    Message,
    EnrichedPost,
    SquadAnnouncement,
    SquadShift,
    Facility,
    AppNotification
} from '@/types/types';

const { databaseId, collections } = APPWRITE_CONFIG;

// 💡 FIX TYPESCRIPT: Impostiamo i fallback per evitare errori "string | undefined" su Vercel
const ANNOUNCEMENTS_COLLECTION = (collections as any).announcements || 'announcements_mock_id';
const SHIFTS_COLLECTION = (collections as any).shifts || 'shifts_mock_id';
const FACILITIES_COLLECTION = (collections as any).facilities || 'facilities_mock_id';
const NOTIFICATIONS_COLLECTION = (collections as any).notifications || 'notifications_mock_id';

type Profile = UserProfile | StructureProfile;

export const databaseService = {
    // ==========================================
    // PROFILI & PRESENZA (ECOSISTEMA VIVO)
    // ==========================================
    async initializeProfile(userId: string, email: string, userType: 'professional' | 'structure', name: string) {
        const profileData = userType === 'professional' 
            ? { userId, email, userType, firstName: name, readReceipts: true, availableForEmergencies: false, isOnline: true }
            : { userId, email, userType, structureName: name, readReceipts: true, isOnline: true };

        return await databases.createDocument(databaseId, collections.profiles, userId, profileData);
    },

    async getProfile(userId: string): Promise<Profile> {
        return await databases.getDocument<Profile>(databaseId, collections.profiles, userId);
    },

    async updateProfile(userId: string, data: Partial<Profile>) {
        const cleanData = { ...data };
        delete (cleanData as any).$id;
        delete (cleanData as any).$createdAt;
        delete (cleanData as any).$updatedAt;
        delete (cleanData as any).$permissions;
        delete (cleanData as any).$databaseId;
        delete (cleanData as any).$collectionId;

        return await databases.updateDocument(databaseId, collections.profiles, userId, cleanData);
    },

    async updatePresence(userId: string, isOnline: boolean) {
        try {
            return await databases.updateDocument(databaseId, collections.profiles, userId, {
                isOnline,
                lastActive: new Date().toISOString()
            });
        } catch (error) {}
    },

    // ==========================================
    // CHAT & MESSAGING REAL-TIME
    // ==========================================
    async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
        return await databases.createDocument<Message>(databaseId, collections.messages, ID.unique(), { conversationId, senderId, receiverId, content, isRead: false });
    },

    async setTypingStatus(userId: string, targetUserId: string | null) {
        try { 
            return await databases.updateDocument(databaseId, collections.profiles, userId, { typingTo: targetUserId }); 
        } catch (error) {}
    },

    async markMessagesAsRead(conversationId: string, currentUserId: string) {
        try {
            const unreadMessages = await databases.listDocuments<Message>(databaseId, collections.messages, [
                Query.equal('conversationId', conversationId), 
                Query.equal('receiverId', currentUserId), 
                Query.equal('isRead', false)
            ]);
            const updatePromises = unreadMessages.documents.map(msg => 
                databases.updateDocument(databaseId, collections.messages, msg.$id, { isRead: true })
            );
            return await Promise.all(updatePromises);
        } catch (error) {}
    },

    // ==========================================
    // NOTIFICHE (CENTRO NOTIFICHE)
    // ==========================================
    async getUnreadNotifications(userId: string) {
        try {
            const res = await databases.listDocuments<AppNotification>(databaseId, NOTIFICATIONS_COLLECTION, [
                Query.equal('userId', userId),
                Query.equal('isRead', false),
                Query.orderDesc('$createdAt')
            ]);
            return res.documents;
        } catch (error) { 
            return []; 
        }
    },
    
    async markNotificationAsRead(notificationId: string) {
        try { 
            return await databases.updateDocument(databaseId, NOTIFICATIONS_COLLECTION, notificationId, { isRead: true }); 
        } catch (error) { 
            return null; 
        }
    },

    // ==========================================
    // 🌊 FEED (EFFETTO ONDA) E POSTS
    // ==========================================
    async createPost(postData: Partial<Post>) {
        return await databases.createDocument<Post>(databaseId, collections.posts, ID.unique(), postData);
    },

    async getFeed(currentUserId: string, userConnections: string[], limit = 20, offset = 0): Promise<EnrichedPost[]> {
        const response = await databases.listDocuments<Post>(databaseId, collections.posts, [
            Query.orderDesc('$createdAt'),
            Query.limit(100) 
        ]);

        const allPosts = response.documents;
        const postIds = allPosts.map(p => p.$id);
        let relevantLikes: Like[] = [];

        const safeConnections = userConnections.slice(0, 50);
        if (postIds.length > 0 && safeConnections.length > 0) {
            try {
                const likesRes = await databases.listDocuments<Like>(databaseId, collections.likes, [
                    Query.equal('userId', safeConnections),
                    Query.limit(100),
                    Query.orderDesc('$createdAt')
                ]);
                relevantLikes = likesRes.documents;
            } catch(e) {}
        }

        const enrichedPosts: EnrichedPost[] = [];

        for (const post of allPosts) {
            const isMine = post.authorId === currentUserId;
            const isConnection = userConnections.includes(post.authorId);
            let recommendedBy: { id: string, name: string } | undefined = undefined;

            if (!isMine && !isConnection) {
                const connectionLike = relevantLikes.find(l => l.postId === post.$id);
                if (connectionLike) {
                    try {
                        const recommender = await this.getProfile(connectionLike.userId);
                        const name = recommender.userType === 'professional'
                            ? `${(recommender as UserProfile).firstName} ${(recommender as UserProfile).lastName}`.trim()
                            : (recommender as StructureProfile).structureName || 'Una struttura';
                        recommendedBy = { id: recommender.userId || recommender.$id, name };
                    } catch (e) {}
                }
            }

            if (isMine || isConnection || recommendedBy) {
                enrichedPosts.push({ ...post, recommendedBy });
            }
        }

        return enrichedPosts.slice(offset, offset + limit);
    },

    async toggleLike(postId: string, userId: string) {
        const existingLikes = await databases.listDocuments<Like>(databaseId, collections.likes, [
            Query.equal('postId', postId), 
            Query.equal('userId', userId)
        ]);
        const post = await databases.getDocument<Post>(databaseId, collections.posts, postId);

        if (existingLikes.total > 0) {
            await databases.deleteDocument(databaseId, collections.likes, existingLikes.documents[0].$id);
            await databases.updateDocument(databaseId, collections.posts, postId, { likesCount: Math.max(0, (post.likesCount || 0) - 1) });
            return false;
        } else {
            await databases.createDocument(databaseId, collections.likes, ID.unique(), { postId, userId });
            await databases.updateDocument(databaseId, collections.posts, postId, { likesCount: (post.likesCount || 0) + 1 });
            return true;
        }
    },

    async getPostLikers(postId: string): Promise<Profile[]> {
        const likes = await databases.listDocuments<Like>(databaseId, collections.likes, [Query.equal('postId', postId)]);
        if (likes.documents.length === 0) return [];
        const userIds = likes.documents.map(like => like.userId);
        const profiles = await Promise.all(userIds.map(id => databases.getDocument<Profile>(databaseId, collections.profiles, id).catch(() => null)));
        return profiles.filter((p): p is Profile => p !== null);
    },

    async createComment(postId: string, authorId: string, content: string, parentCommentId: string | null = null) {
        const comment = await databases.createDocument<Comment>(databaseId, collections.comments, ID.unique(), { postId, authorId, content, parentCommentId });
        const post = await databases.getDocument<Post>(databaseId, collections.posts, postId);
        await databases.updateDocument(databaseId, collections.posts, postId, { commentsCount: (post.commentsCount || 0) + 1 });
        return comment;
    },

    async getPostComments(postId: string) {
        const response = await databases.listDocuments<Comment>(databaseId, collections.comments, [
            Query.equal('postId', postId), 
            Query.orderAsc('$createdAt')
        ]);
        const enrichedComments = await Promise.all(response.documents.map(async (comment) => {
            try {
                const author = await databases.getDocument<Profile>(databaseId, collections.profiles, comment.authorId);
                return { ...comment, author, authorType: author.userType, createdAt: comment.$createdAt };
            } catch {
                return { ...comment, author: null, authorType: 'professional', createdAt: comment.$createdAt };
            }
        }));
        const mainComments = enrichedComments.filter(c => !c.parentCommentId);
        const replies = enrichedComments.filter(c => c.parentCommentId);
        return mainComments.map(mc => ({ ...mc, replies: replies.filter(r => r.parentCommentId === mc.$id) }));
    },

    // ==========================================
    // JOBS & APPLICATIONS
    // ==========================================
    async createJob(jobData: Partial<Job>) {
        return await databases.createDocument<Job>(databaseId, collections.jobs, ID.unique(), jobData);
    },

    async getActiveJobs() {
        const response = await databases.listDocuments<Job>(databaseId, collections.jobs, [
            Query.equal('isActive', true), 
            Query.orderDesc('$createdAt')
        ]);
        return response.documents;
    },

    async applyForJob(applicationData: Partial<Application>) {
        const existing = await databases.listDocuments(databaseId, collections.applications, [
            Query.equal('jobId', applicationData.jobId!), 
            Query.equal('applicantId', applicationData.applicantId!)
        ]);
        if (existing.total > 0) throw new Error('Ti sei già candidato per questa posizione.');
        return await databases.createDocument<Application>(databaseId, collections.applications, ID.unique(), applicationData);
    },

    async getJobApplications(jobId: string) {
        try {
            const response = await databases.listDocuments<Application>(databaseId, collections.applications, [
                Query.equal('jobId', jobId), 
                Query.orderDesc('$createdAt')
            ]);
            return response.documents;
        } catch (error) { 
            return []; 
        }
    },

    async updateApplicationStatus(applicationId: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'hired') {
        try { 
            const updated = await databases.updateDocument<Application>(databaseId, collections.applications, applicationId, { status }); 
            // 💡 Invia notifica se la candidatura viene scartata
            if (status === 'rejected') {
                await databases.createDocument(databaseId, NOTIFICATIONS_COLLECTION, ID.unique(), {
                    userId: updated.applicantId, type: 'rejected', content: `La tua candidatura è stata scartata.`, relatedId: updated.jobId, isRead: false
                }).catch(() => {});
            }
            return updated;
        } catch (error) { 
            return null; 
        }
    },

    // ==========================================
    // NETWORK & COLLEGAMENTI
    // ==========================================
    async sendConnectionRequest(senderId: string, receiverId: string) {
        const req = await databases.createDocument<Connection>(databaseId, collections.connections, ID.unique(), { senderId, receiverId, status: 'pending' });
        // 💡 Invia notifica per richiesta collegamento
        await databases.createDocument(databaseId, NOTIFICATIONS_COLLECTION, ID.unique(), {
            userId: receiverId, type: 'connection', content: `Hai ricevuto una nuova richiesta di collegamento.`, relatedId: senderId, isRead: false
        }).catch(() => {});
        return req;
    },

    async getPendingConnectionRequests(userId: string) {
        const res = await databases.listDocuments<Connection>(databaseId, collections.connections, [
            Query.equal('receiverId', userId), 
            Query.equal('status', 'pending'), 
            Query.orderDesc('$createdAt')
        ]);
        return res.documents;
    },

    async acceptConnectionRequest(connectionId: string, senderId: string, receiverId: string) {
        await databases.updateDocument(databaseId, collections.connections, connectionId, { status: 'accepted' });
        const senderProfile = await this.getProfile(senderId);
        const receiverProfile = await this.getProfile(receiverId);
        
        const senderConns = senderProfile.connections || [];
        const receiverConns = receiverProfile.connections || [];
        
        if (!senderConns.includes(receiverId)) {
            await this.updateProfile(senderId, { connections: [...senderConns, receiverId] });
        }
        if (!receiverConns.includes(senderId)) {
            await this.updateProfile(receiverId, { connections: [...receiverConns, senderId] });
        }
    },

    async rejectConnectionRequest(connectionId: string) {
        return await databases.updateDocument(databaseId, collections.connections, connectionId, { status: 'rejected' });
    },

    async getNetworkSuggestions(currentUserId: string, currentConnections: string[] = []) {
        const res = await databases.listDocuments<Profile>(databaseId, collections.profiles, [
            Query.notEqual('userId', currentUserId), 
            Query.orderDesc('$createdAt'), 
            Query.limit(20)
        ]);
        return res.documents.filter(p => !currentConnections.includes(p.userId || p.$id));
    },

    async getConnectionsProfiles(connectionIds: string[]) {
        if (!connectionIds || connectionIds.length === 0) return [];
        try {
            const safeIds = connectionIds.slice(0, 100);
            const res = await databases.listDocuments<Profile>(databaseId, collections.profiles, [
                Query.equal('$id', safeIds)
            ]);
            return res.documents;
        } catch(e) { 
            return []; 
        }
    },
    
    async removeConnection(userId1: string, userId2: string) {
        try {
            const p1 = await this.getProfile(userId1);
            const p2 = await this.getProfile(userId2);
            
            const c1 = (p1.connections || []).filter(id => id !== userId2);
            const c2 = (p2.connections || []).filter(id => id !== userId1);
            
            await this.updateProfile(userId1, { connections: c1 });
            await this.updateProfile(userId2, { connections: c2 });
            return true;
        } catch(e) { 
            return false; 
        }
    },

    async searchNetwork(searchQuery: string, currentUserId: string) {
        if (!searchQuery || searchQuery.trim().length < 2) return { profiles: [], facilities: [] };
        const q = searchQuery.toLowerCase().trim();
        
        try {
            const profRes = await databases.listDocuments<Profile>(databaseId, collections.profiles, [
                Query.limit(100), 
                Query.orderDesc('$createdAt')
            ]);
            const facRes = await databases.listDocuments<Facility>(databaseId, FACILITIES_COLLECTION, [
                Query.limit(50), 
                Query.orderDesc('$createdAt')
            ]);
            
            const profiles = profRes.documents.filter(p => {
                if (p.userId === currentUserId || p.$id === currentUserId) return false;
                const isProf = p.userType === 'professional';
                const name = isProf 
                    ? `${(p as UserProfile).firstName || ''} ${(p as UserProfile).lastName || ''}`.trim() 
                    : (p as StructureProfile).structureName || '';
                const role = isProf 
                    ? (p as UserProfile).title || '' 
                    : (p as StructureProfile).structureType || '';
                
                return name.toLowerCase().includes(q) || role.toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q);
            });

            const facilities = facRes.documents.filter(f => {
                return (f.name || '').toLowerCase().includes(q) || 
                       (f.type || '').toLowerCase().includes(q) || 
                       (f.city || '').toLowerCase().includes(q);
            });

            return { profiles, facilities };
        } catch (e) {
            console.error("Search error", e);
            return { profiles: [], facilities: [] };
        }
    },

    // ==========================================
    // 🏊‍♂️ SWIM-SQUAD (TEAM MANAGEMENT)
    // ==========================================
    async createSquadAnnouncement(data: Partial<SquadAnnouncement>) {
        try {
            return await databases.createDocument<SquadAnnouncement>(databaseId, ANNOUNCEMENTS_COLLECTION, ID.unique(), data);
        } catch(e) { console.error("🔥 Errore salvataggio Annuncio su DB:", e); return null; }
    },
    async getSquadAnnouncements(structureId: string) {
        try {
            const res = await databases.listDocuments<SquadAnnouncement>(databaseId, ANNOUNCEMENTS_COLLECTION, [
                Query.equal('structureId', structureId), 
                Query.orderDesc('$createdAt')
            ]);
            return res.documents;
        } catch(e) { console.error("🔥 Errore lettura Annunci:", e); return []; }
    },
    async deleteSquadAnnouncement(announcementId: string) {
        try {
            await databases.deleteDocument(databaseId, ANNOUNCEMENTS_COLLECTION, announcementId);
            return true;
        } catch(e) { 
            console.error("Errore eliminazione annuncio", e); 
            return false; 
        }
    },
    async createSquadShift(data: Partial<SquadShift>) {
        try {
            return await databases.createDocument<SquadShift>(databaseId, SHIFTS_COLLECTION, ID.unique(), data);
        } catch(e) { console.error("🔥 Errore salvataggio Turno su DB:", e); return null; }
    },
    async getSquadShifts(structureId: string) {
        try {
            const res = await databases.listDocuments<SquadShift>(databaseId, SHIFTS_COLLECTION, [
                Query.equal('structureId', structureId), 
                Query.orderAsc('date')
            ]);
            return res.documents;
        } catch(e) { console.error("🔥 Errore lettura Turni:", e); return []; }
    },
    async deleteSquadShift(shiftId: string) {
        try {
            await databases.deleteDocument(databaseId, SHIFTS_COLLECTION, shiftId);
        } catch(e) { console.error("Errore eliminazione turno", e); }
    },

    // ==========================================
    // 🏢 FACILITIES (PAGINE AZIENDALI E HR)
    // ==========================================
    async createFacility(data: Partial<Facility>, adminId: string) {
        try {
            const facilityData = {
                ...data,
                admins: [adminId],
                staff: [],
                followers: []
            };
            const facility = await databases.createDocument<Facility>(databaseId, FACILITIES_COLLECTION, ID.unique(), facilityData);
            
            const userProfile = await this.getProfile(adminId) as UserProfile;
            const managed = userProfile.managedFacilities || [];
            await this.updateProfile(adminId, { managedFacilities: [...managed, facility.$id] });
            
            return facility;
        } catch(e) { console.error("🔥 Errore salvataggio Pagina Struttura su DB:", e); return null; }
    },
    
    async getFacility(facilityId: string) {
        try {
            return await databases.getDocument<Facility>(databaseId, FACILITIES_COLLECTION, facilityId);
        } catch(e) { console.error("🔥 Errore lettura Pagina Struttura:", e); return null; }
    },
    
    async updateFacility(facilityId: string, data: Partial<Facility>) {
        try {
            const cleanData = { ...data };
            delete (cleanData as any).$id;
            delete (cleanData as any).$createdAt;
            delete (cleanData as any).$updatedAt;
            return await databases.updateDocument<Facility>(databaseId, FACILITIES_COLLECTION, facilityId, cleanData);
        } catch(e) { console.error("🔥 Errore aggiornamento Pagina Struttura:", e); return null; }
    },
    
    async getManagedFacilities(adminId: string) {
        try {
            const userProfile = await this.getProfile(adminId) as UserProfile;
            const facilityIds = userProfile.managedFacilities || [];
            
            if (facilityIds.length === 0) return [];

            const res = await databases.listDocuments<Facility>(databaseId, FACILITIES_COLLECTION, [
                Query.equal('$id', facilityIds),
                Query.orderDesc('$createdAt')
            ]);
            return res.documents;
        } catch(e) { console.error("🔥 Errore lettura Pagine Gestite:", e); return []; }
    },

    // 💡 Toggle Followers Pagina Aziendale
    async toggleFollowFacility(facilityId: string, userId: string) {
        try {
            const fac = await databases.getDocument<Facility>(databaseId, FACILITIES_COLLECTION, facilityId);
            const followers = fac.followers || [];
            const isFollowing = followers.includes(userId);
            
            const newFollowers = isFollowing 
                ? followers.filter(id => id !== userId) 
                : [...followers, userId];
                
            await databases.updateDocument(databaseId, FACILITIES_COLLECTION, facilityId, { followers: newFollowers });
            return !isFollowing; 
        } catch(e) { 
            return null; 
        }
    },

    // 💡 LA MAGIA DELL'HR: FUNZIONI ASSUNZIONE E LICENZIAMENTO
    async hireCandidate(applicationId: string, jobId: string, structureId: string, applicantId: string) {
        try {
            // 1. Aggiorna lo stato Candidatura ad 'Assunto'
            await databases.updateDocument(databaseId, collections.applications, applicationId, { status: 'hired' });
            
            // 2. Chiude l'Annuncio di lavoro togliendolo dalla bacheca pubblica
            await databases.updateDocument(databaseId, collections.jobs, jobId, { isActive: false });
            
            // 3. Aggiunge il dipendente allo Staff della Struttura (Sia nuova Facility che vecchia StructureProfile)
            let facilityName = 'Una Struttura';
            try {
                const fac = await databases.getDocument<Facility>(databaseId, FACILITIES_COLLECTION, structureId);
                facilityName = fac.name;
                const staff = fac.staff || [];
                if (!staff.includes(applicantId)) {
                    await databases.updateDocument(databaseId, FACILITIES_COLLECTION, structureId, { staff: [...staff, applicantId] });
                }
            } catch {
                const prof = await databases.getDocument<StructureProfile>(databaseId, collections.profiles, structureId);
                facilityName = prof.structureName || 'Una Struttura';
                const conns = prof.connections || [];
                if (!conns.includes(applicantId)) {
                    await databases.updateDocument(databaseId, collections.profiles, structureId, { connections: [...conns, applicantId] });
                }
            }

            // 💡 Invia Notifica Biglietto D'Oro al Candidato!
            await databases.createDocument(databaseId, NOTIFICATIONS_COLLECTION, ID.unique(), {
                userId: applicantId, 
                type: 'hired', 
                content: `🎉 Congratulazioni! Sei stato assunto da ${facilityName}.`, 
                relatedId: structureId, 
                isRead: false
            }).catch(() => {});

            return true;
        } catch (error) {
            console.error('Error in hireCandidate:', error);
            return false;
        }
    },

    async removeStaffMember(structureId: string, staffId: string) {
        try {
            try {
                // Rimuovi da Facility (Modello nuovo)
                const fac = await databases.getDocument<Facility>(databaseId, FACILITIES_COLLECTION, structureId);
                const staff = (fac.staff || []).filter(id => id !== staffId);
                await databases.updateDocument(databaseId, FACILITIES_COLLECTION, structureId, { staff });
            } catch {
                // Rimuovi da Legacy Structure (Modello vecchio)
                const prof = await databases.getDocument<StructureProfile>(databaseId, collections.profiles, structureId);
                const conns = (prof.connections || []).filter(id => id !== staffId);
                await databases.updateDocument(databaseId, collections.profiles, structureId, { connections: conns });
            }
            return true;
        } catch (error) {
            console.error('Error in removeStaffMember:', error);
            return false;
        }
    }
};