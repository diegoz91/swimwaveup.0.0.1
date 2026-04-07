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
    Message
} from '@/types/types';

const { databaseId, collections } = APPWRITE_CONFIG;
type Profile = UserProfile | StructureProfile;

export const databaseService = {
    // ==========================================
    // PROFILI
    // ==========================================
    async initializeProfile(userId: string, email: string, userType: 'professional' | 'structure', name: string) {
        const profileData = userType === 'professional' 
            ? { userId, email, userType, firstName: name, readReceipts: true }
            : { userId, email, userType, structureName: name, readReceipts: true };

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

    // ==========================================
    // CHAT & MESSAGING REAL-TIME
    // ==========================================
    async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
        return await databases.createDocument<Message>(
            databaseId,
            collections.messages,
            ID.unique(),
            {
                conversationId,
                senderId,
                receiverId,
                content,
                isRead: false
            }
        );
    },

    async setTypingStatus(userId: string, targetUserId: string | null) {
        try {
            return await databases.updateDocument(
                databaseId, 
                collections.profiles, 
                userId, 
                { typingTo: targetUserId }
            );
        } catch (error) {
            console.error("Typing status error:", error);
        }
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
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    },

    // ==========================================
    // POSTS & FEED
    // ==========================================
    async createPost(postData: Partial<Post>) {
        return await databases.createDocument<Post>(databaseId, collections.posts, ID.unique(), postData);
    },

    async getFeed(limit = 20, offset = 0) {
        const response = await databases.listDocuments<Post>(databaseId, collections.posts, [
            Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset(offset)
        ]);
        return response.documents;
    },

    async toggleLike(postId: string, userId: string) {
        const existingLikes = await databases.listDocuments<Like>(databaseId, collections.likes, [
            Query.equal('postId', postId), Query.equal('userId', userId)
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
        const response = await databases.listDocuments<Comment>(databaseId, collections.comments, [Query.equal('postId', postId), Query.orderAsc('$createdAt')]);
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
        const response = await databases.listDocuments<Job>(databaseId, collections.jobs, [Query.equal('isActive', true), Query.orderDesc('$createdAt')]);
        return response.documents;
    },

    async applyForJob(applicationData: Partial<Application>) {
        const existing = await databases.listDocuments(databaseId, collections.applications, [
            Query.equal('jobId', applicationData.jobId!), Query.equal('applicantId', applicationData.applicantId!)
        ]);
        if (existing.total > 0) throw new Error('Ti sei già candidato per questa posizione.');
        return await databases.createDocument<Application>(databaseId, collections.applications, ID.unique(), applicationData);
    },

    // ==========================================
    // NETWORK & COLLEGAMENTI
    // ==========================================
    async sendConnectionRequest(senderId: string, receiverId: string) {
        return await databases.createDocument<Connection>(databaseId, collections.connections, ID.unique(), { senderId, receiverId, status: 'pending' });
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
        // 1. Aggiorna lo stato della richiesta
        await databases.updateDocument(databaseId, collections.connections, connectionId, { status: 'accepted' });
        
        // 2. Aggiungi gli ID ai rispettivi array "connections" dei profili
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
        
        // Filtra via quelli con cui sei già collegato
        return res.documents.filter(p => !currentConnections.includes(p.userId || p.$id));
    }
};