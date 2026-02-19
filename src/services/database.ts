// src/services/database.ts - CON TIPI CORRETTI
import { databases, storage, account } from './appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';
import { ID, Query } from 'appwrite';
import { Certification, Experience, UserProfile, StructureProfile } from '@/types';

// Keep original interface but add helper methods
interface CompleteUserProfile extends UserProfile {
  experienceDetails?: string;
  certificationDetails?: string;
}

// Helper functions
const serializeExperience = (experience: Experience[]): string => {
  return JSON.stringify(experience);
};

const deserializeExperience = (experienceDetails?: string): Experience[] => {
  if (!experienceDetails) return [];
  try {
    return JSON.parse(experienceDetails);
  } catch (error) {
    console.error('Error parsing experience details:', error);
    return [];
  }
};

const serializeCertifications = (certifications: Certification[]): string => {
  return JSON.stringify(certifications);
};

const deserializeCertifications = (certificationDetails?: string): Certification[] => {
  if (!certificationDetails) return [];
  try {
    return JSON.parse(certificationDetails);
  } catch (error) {
    console.error('Error parsing certification details:', error);
    return [];
  }
};

class DatabaseService {
  private db = databases;
  private storage = storage;
  private dbId = APPWRITE_CONFIG.databaseId;
  private collections = APPWRITE_CONFIG.collections;

  // ==================== DEBUG SESSION ====================
  private async debugSession() {
    try {
      const session = await account.getSession('current');
      const user = await account.get();
      console.log('🔍 DEBUG - Current session:', {
        sessionId: session.$id,
        userId: user.$id,
        userEmail: user.email
      });
      return { session, user };
    } catch (error) {
      console.error('❌ DEBUG - No active session:', error);
      throw new Error('No active session found');
    }
  }

  // ==================== USERS & STRUCTURES ====================

  async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      console.log('🔍 Creating user profile for:', userId);
      await this.debugSession();

      const user = await this.db.createDocument(
        this.dbId,
        this.collections.users,
        userId,
        {
          userId,
          userType: 'professional',
          isActive: true,
          ...profileData
        }
      );
      console.log('✅ User profile created:', user.$id);
      return user;
    } catch (error) {
      console.error('❌ createUserProfile error:', error);
      throw error;
    }
  }

  async createStructureProfile(userId: string, profileData: any) {
    try {
      console.log('🔍 Creating structure profile for:', userId);
      console.log('🔍 Profile data:', profileData);

      await this.debugSession();

      console.log('🔍 Using collection ID:', this.collections.structures);
      console.log('🔍 Using database ID:', this.dbId);

      const structure = await this.db.createDocument(
        this.dbId,
        this.collections.structures,
        userId,
        {
          userId,
          userType: 'structure',
          isActive: true,
          ...profileData
        }
      );
      console.log('✅ Structure profile created:', structure.$id);
      return structure;
    } catch (error) {
      console.error('❌ createStructureProfile error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const profile = await this.db.getDocument(this.dbId, this.collections.users, userId) as any;
      return {
        ...profile,
        experienceList: deserializeExperience(profile.experienceDetails),
        certificationsList: deserializeCertifications(profile.certificationDetails)
      } as UserProfile;
    } catch (error) {
      console.error('getUserProfile error:', error);
      throw error;
    }
  }

  async getStructureProfile(userId: string): Promise<StructureProfile> {
    try {
      const structure = await this.db.getDocument(this.dbId, this.collections.structures, userId);
      return structure as StructureProfile;
    } catch (error) {
      console.error('getStructureProfile error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const dbUpdates = { ...updates };

      if (updates.experienceList) {
        dbUpdates.experienceDetails = serializeExperience(updates.experienceList);
        if ('experience' in updates || true) {
          dbUpdates.experience = updates.experienceList.length;
        }
        delete dbUpdates.experienceList;
      }

      if (updates.certificationsList) {
        dbUpdates.certificationDetails = serializeCertifications(updates.certificationsList);
        if ('qualifications' in updates || true) {
          dbUpdates.qualifications = updates.certificationsList.map((cert: Certification) => cert.name);
        }
        delete dbUpdates.certificationsList;
      }

      const updatedProfile = await this.db.updateDocument(
        this.dbId,
        this.collections.users,
        userId,
        dbUpdates
      );
      console.log('✅ User profile updated:', userId);
      return updatedProfile;
    } catch (error) {
      console.error('updateUserProfile error:', error);
      throw error;
    }
  }

  async initializeUserProfile(user: any) {
    try {
      const profileData = {
        firstName: user.name?.split(' ')[0] || 'User',
        lastName: user.name?.split(' ')[1] || '',
        email: user.email,
        city: '',
        province: '',
        bio: 'Welcome to my profile!'
      };

      return await this.createUserProfile(user.$id, profileData);
    } catch (error) {
      console.error('initializeUserProfile error:', error);
      throw error;
    }
  }

  async getAllUsers(limit = 50) {
    try {
      const users = await this.db.listDocuments(
        this.dbId,
        this.collections.users,
        [
          Query.equal('isActive', true),
          Query.limit(limit),
          Query.orderDesc('$createdAt')
        ]
      );

      return users.documents.map(user => ({
        ...user,
        experienceList: deserializeExperience(user.experienceDetails),
        certificationsList: deserializeCertifications(user.certificationDetails)
      }));
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw error;
    }
  }

  async getAllStructures(limit = 50) {
    try {
      return await this.db.listDocuments(
        this.dbId,
        this.collections.structures,
        [
          Query.equal('isActive', true),
          Query.limit(limit),
          Query.orderDesc('$createdAt')
        ]
      );
    } catch (error) {
      console.error('getAllStructures error:', error);
      throw error;
    }
  }

  // ==================== POSTS ====================
  async createPost(postData: object) {
    try {
      const post = await this.db.createDocument(
        this.dbId,
        this.collections.posts,
        ID.unique(),
        {
          ...postData,
        }
      );
      console.log('✅ Post created:', post.$id);
      return post;
    } catch (error) {
      console.error('createPost error:', error);
      throw error;
    }
  }

  async getFeedPosts(limit = 20, offset = 0) {
    try {
      return await this.db.listDocuments(
        this.dbId,
        this.collections.posts,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
    } catch (error) {
      console.error('getFeedPosts error:', error);
      throw error;
    }
  }

  // ==================== LIKES ====================
  async toggleLike(postId: string, userId: string) {
    try {
      const existingLikes = await this.db.listDocuments(
        this.dbId,
        this.collections.likes,
        [
          Query.equal('postId', postId),
          Query.equal('userId', userId)
        ]
      );

      if (existingLikes.documents.length > 0) {
        await this.db.deleteDocument(
          this.dbId,
          this.collections.likes,
          existingLikes.documents[0].$id
        );

        await this.decrementPostLikes(postId);
        console.log('Like removed');
        return { liked: false };
      } else {
        await this.db.createDocument(
          this.dbId,
          this.collections.likes,
          ID.unique(),
          {
            postId,
            userId,
            likedAt: new Date().toISOString()
          }
        );

        await this.incrementPostLikes(postId);
        console.log('Like added');
        return { liked: true };
      }
    } catch (error) {
      console.error('toggleLike error:', error);
      throw error;
    }
  }

  async checkUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const likes = await this.db.listDocuments(
        this.dbId,
        this.collections.likes,
        [
          Query.equal('postId', postId),
          Query.equal('userId', userId)
        ]
      );
      return likes.documents.length > 0;
    } catch (error) {
      console.error('checkUserLiked error:', error);
      return false;
    }
  }

  async getPostLikers(postId: string) {
    try {
      const likes = await this.db.listDocuments(
        this.dbId,
        this.collections.likes,
        [Query.equal('postId', postId)]
      );

      const likerProfiles = [];
      for (const like of likes.documents) {
        try {
          let profile;
          try {
            profile = await this.getUserProfile(like.userId);
            profile.userType = 'professional';
          } catch {
            profile = await this.getStructureProfile(like.userId);
            profile.userType = 'structure';
          }
          likerProfiles.push(profile);
        } catch (error) {
          console.warn(`Could not find profile for user ${like.userId}`);
        }
      }

      return likerProfiles;
    } catch (error) {
      console.error('getPostLikers error:', error);
      return [];
    }
  }

  private async incrementPostLikes(postId: string) {
    try {
      const post = await this.db.getDocument(this.dbId, this.collections.posts, postId);
      const currentCount = (post.likesCount as number || 0);
      await this.db.updateDocument(
        this.dbId,
        this.collections.posts,
        postId,
        { likesCount: currentCount + 1 }
      );
    } catch (error) {
      console.error('incrementPostLikes error:', error);
    }
  }

  private async decrementPostLikes(postId: string) {
    try {
      const post = await this.db.getDocument(this.dbId, this.collections.posts, postId);
      const currentCount = (post.likesCount as number || 0);
      await this.db.updateDocument(
        this.dbId,
        this.collections.posts,
        postId,
        { likesCount: Math.max(0, currentCount - 1) }
      );
    } catch (error) {
      console.error('decrementPostLikes error:', error);
    }
  }

  // ==================== COMMENTS ====================
  async createComment(postId: string, authorId: string, content: string, parentCommentId?: string) {
    try {
      let authorType: 'professional' | 'structure';

      try {
        await this.getUserProfile(authorId);
        authorType = 'professional';
      } catch {
        authorType = 'structure';
      }

      const comment = await this.db.createDocument(
        this.dbId,
        this.collections.comments,
        ID.unique(),
        {
          postId,
          authorId,
          authorType,
          content: content.trim(),
          parentCommentId: parentCommentId || null,
          createdAt: new Date().toISOString()
        }
      );

      if (!parentCommentId) {
        await this.incrementPostComments(postId);
      }

      console.log('Comment created:', comment.$id);
      return comment;
    } catch (error) {
      console.error('createComment error:', error);
      throw error;
    }
  }

  async getPostComments(postId: string) {
    try {
      const comments = await this.db.listDocuments(
        this.dbId,
        this.collections.comments,
        [
          Query.equal('postId', postId),
          Query.orderAsc('$createdAt')
        ]
      );

      const commentsWithAuthors = [];
      for (const comment of comments.documents) {
        try {
          let author;
          if (comment.authorType === 'professional') {
            author = await this.getUserProfile(comment.authorId);
          } else {
            author = await this.getStructureProfile(comment.authorId);
          }

          commentsWithAuthors.push({
            ...comment,
            author
          });
        } catch (error) {
          console.warn(`Could not find author for comment ${comment.$id}`);
          commentsWithAuthors.push({
            ...comment,
            author: null
          });
        }
      }

      return commentsWithAuthors;
    } catch (error) {
      console.error('getPostComments error:', error);
      return [];
    }
  }

  private async incrementPostComments(postId: string) {
    try {
      const post = await this.db.getDocument(this.dbId, this.collections.posts, postId);
      const currentCount = (post.commentsCount as number || 0);
      await this.db.updateDocument(
        this.dbId,
        this.collections.posts,
        postId,
        { commentsCount: currentCount + 1 }
      );
    } catch (error) {
      console.error('incrementPostComments error:', error);
    }
  }

  // ==================== JOBS ====================
  async createJob(jobData: object) {
    try {
      const job = await this.db.createDocument(
        this.dbId,
        this.collections.jobs,
        ID.unique(),
        jobData
      );
      console.log('✅ Job created:', job.$id);
      return job;
    } catch (error) {
      console.error('createJob error:', error);
      throw error;
    }
  }

  async getJobs(filters: { city?: string; role?: string; isActive?: boolean } = {}) {
    try {
      const queries = [Query.orderDesc('$createdAt')];

      if (filters.city) {
        queries.push(Query.equal('city', filters.city));
      }
      if (filters.role) {
        queries.push(Query.equal('role', filters.role));
      }
      if (filters.isActive !== undefined) {
        queries.push(Query.equal('isActive', filters.isActive));
      }

      const jobs = await this.db.listDocuments(
        this.dbId,
        this.collections.jobs,
        queries
      );
      return jobs;
    } catch (error) {
      console.error('getJobs error:', error);
      throw error;
    }
  }

  // ==================== APPLICATIONS ====================
  async createApplication(applicationData: { jobId: string, [key: string]: any }) {
    try {
      const application = await this.db.createDocument(
        this.dbId,
        this.collections.applications,
        ID.unique(),
        {
          ...applicationData,
          appliedAt: new Date().toISOString()
        }
      );

      await this.incrementJobApplications(applicationData.jobId);

      console.log('✅ Application created:', application.$id);
      return application;
    } catch (error) {
      console.error('createApplication error:', error);
      throw error;
    }
  }

  private async incrementJobApplications(jobId: string) {
    try {
      const job = await this.db.getDocument(this.dbId, this.collections.jobs, jobId);
      const currentCount = (job.applicationsCount as number || 0);
      await this.db.updateDocument(
        this.dbId,
        this.collections.jobs,
        jobId,
        { applicationsCount: currentCount + 1 }
      );
    } catch (error) {
      console.error('incrementJobApplications error:', error);
    }
  }

  // ==================== MESSAGES & CONVERSATIONS ====================

  async sendMessage(senderId: string, receiverId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text', mediaUrl?: string) {
    try {
      const conversationId = [senderId, receiverId].sort().join('_');

      const message = await this.db.createDocument(
        this.dbId,
        this.collections.messages,
        ID.unique(),
        {
          senderId,
          receiverId,
          content,
          messageType,
          mediaUrl: mediaUrl || null,
          conversationId,
          isRead: false,
          sentAt: new Date().toISOString()
        }
      );

      console.log('✅ Message sent:', message.$id);
      return message;
    } catch (error) {
      console.error('sendMessage error:', error);
      throw error;
    }
  }

  async getMyConversations(userId: string) {
    try {
      const sentMessages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('senderId', userId),
          Query.orderDesc('sentAt'),
          Query.limit(100)
        ]
      );

      const receivedMessages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('receiverId', userId),
          Query.orderDesc('sentAt'),
          Query.limit(100)
        ]
      );

      const allMessages = [...sentMessages.documents, ...receivedMessages.documents];
      const conversationsMap = new Map();

      for (const msg of allMessages) {
        const convId = msg.conversationId;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            conversationId: convId,
            lastMessage: msg,
            unreadCount: 0,
            participantId: msg.senderId === userId ? msg.receiverId : msg.senderId
          });
        }

        if (msg.receiverId === userId && !msg.isRead) {
          conversationsMap.get(convId).unreadCount++;
        }
      }

      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());

      const conversationsWithProfiles = [];
      for (const conv of conversations) {
        try {
          let participant: UserProfile | StructureProfile;
          try {
            participant = await this.getUserProfile(conv.participantId);
          } catch {
            participant = await this.getStructureProfile(conv.participantId);
          }

          conversationsWithProfiles.push({
            ...conv,
            participant
          });
        } catch (error) {
          console.warn(`Could not load profile for ${conv.participantId}`);
        }
      }

      return conversationsWithProfiles;
    } catch (error) {
      console.error('getMyConversations error:', error);
      return [];
    }
  }

  async getConversationMessages(conversationId: string, limit = 50) {
    try {
      const messages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('conversationId', conversationId),
          Query.orderAsc('sentAt'),
          Query.limit(limit)
        ]
      );

      return messages.documents;
    } catch (error) {
      console.error('getConversationMessages error:', error);
      return [];
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      const unreadMessages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('conversationId', conversationId),
          Query.equal('receiverId', userId),
          Query.equal('isRead', false)
        ]
      );

      const updatePromises = unreadMessages.documents.map(msg =>
        this.db.updateDocument(
          this.dbId,
          this.collections.messages,
          msg.$id,
          {
            isRead: true,
            readAt: new Date().toISOString()
          }
        )
      );

      await Promise.all(updatePromises);
      console.log(`✅ Marked ${unreadMessages.documents.length} messages as read`);
    } catch (error) {
      console.error('markMessagesAsRead error:', error);
    }
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    try {
      const unreadMessages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('receiverId', userId),
          Query.equal('isRead', false),
          Query.limit(100)
        ]
      );

      return unreadMessages.total || unreadMessages.documents.length;
    } catch (error) {
      console.error('getUnreadMessagesCount error:', error);
      return 0;
    }
  }

  async getOrCreateConversation(user1Id: string, user2Id: string) {
    try {
      const conversationId = [user1Id, user2Id].sort().join('_');

      const existingMessages = await this.db.listDocuments(
        this.dbId,
        this.collections.messages,
        [
          Query.equal('conversationId', conversationId),
          Query.limit(1)
        ]
      );

      if (existingMessages.documents.length > 0) {
        return await this.getConversationMessages(conversationId);
      }

      return [];
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      return [];
    }
  }

  // ==================== CONNECTIONS ====================
  async createConnection(userId: string, targetUserId: string) {
    try {
      const connection = await this.db.createDocument(
        this.dbId,
        this.collections.connections,
        ID.unique(),
        {
          requesterId: userId,
          receiverId: targetUserId,
          status: 'pending',
          requestedAt: new Date().toISOString()
        }
      );

      console.log('✅ Connection request sent');
      return connection;
    } catch (error) {
      console.error('createConnection error:', error);
      throw error;
    }
  }

  async checkConnection(userId: string, targetUserId: string) {
    try {
      const connections1 = await this.db.listDocuments(
        this.dbId,
        this.collections.connections,
        [
          Query.equal('requesterId', userId),
          Query.equal('receiverId', targetUserId)
        ]
      );

      if (connections1.documents.length > 0) {
        return connections1.documents[0];
      }

      const connections2 = await this.db.listDocuments(
        this.dbId,
        this.collections.connections,
        [
          Query.equal('requesterId', targetUserId),
          Query.equal('receiverId', userId)
        ]
      );

      return connections2.documents.length > 0 ? connections2.documents[0] : null;
    } catch (error) {
      console.error('checkConnection error:', error);
      return null;
    }
  }

  async getPendingConnectionRequests(userId: string) {
    try {
      const requests = await this.db.listDocuments(
        this.dbId,
        this.collections.connections,
        [
          Query.equal('receiverId', userId),
          Query.equal('status', 'pending'),
          Query.orderDesc('$createdAt')
        ]
      );

      const requestsWithProfiles = [];
      for (const request of requests.documents) {
        try {
          const profile = await this.getUserProfile(request.requesterId);
          requestsWithProfiles.push({
            ...request,
            requester: profile
          });
        } catch (error) {
          console.warn(`Could not load profile for ${request.requesterId}`);
        }
      }

      return requestsWithProfiles;
    } catch (error) {
      console.error('getPendingConnectionRequests error:', error);
      return [];
    }
  }

  async getMyConnections(userId: string) {
    try {
      const connections = await this.db.listDocuments(
        this.dbId,
        this.collections.connections,
        [
          Query.equal('status', 'accepted')
        ]
      );

      const myConnections = connections.documents.filter(
        conn => conn.requesterId === userId || conn.receiverId === userId
      );

      const connectionsWithProfiles = [];
      for (const conn of myConnections) {
        const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
        try {
          const profile = await this.getUserProfile(otherUserId);
          connectionsWithProfiles.push({
            ...conn,
            user: profile
          });
        } catch (error) {
          console.warn(`Could not load profile for ${otherUserId}`);
        }
      }

      return connectionsWithProfiles;
    } catch (error) {
      console.error('getMyConnections error:', error);
      return [];
    }
  }

  async acceptConnection(connectionId: string) {
    try {
      const updated = await this.db.updateDocument(
        this.dbId,
        this.collections.connections,
        connectionId,
        {
          status: 'accepted',
          acceptedAt: new Date().toISOString()
        }
      );
      console.log('✅ Connection accepted');
      return updated;
    } catch (error) {
      console.error('acceptConnection error:', error);
      throw error;
    }
  }

  async rejectConnection(connectionId: string) {
    try {
      await this.db.deleteDocument(
        this.dbId,
        this.collections.connections,
        connectionId
      );
      console.log('✅ Connection rejected');
    } catch (error) {
      console.error('rejectConnection error:', error);
      throw error;
    }
  }

  // ==================== PROFILE IMAGES ====================

  async uploadProfileImage(userId: string, file: File): Promise<string> {
    try {
      console.log('📤 Uploading profile image for user:', userId);

      // Prima elimina l'eventuale vecchia immagine
      await this.deleteOldProfileImage(userId);

      // Carica la nuova immagine
      const uploadedFile = await this.storage.createFile(
        APPWRITE_CONFIG.buckets.avatars,
        ID.unique(),
        file
      );

      console.log('✅ Image uploaded:', uploadedFile.$id);

      // Ottieni l'URL pubblico
      const imageUrl = this.getProfileImageUrl(uploadedFile.$id);

      // Aggiorna il profilo utente con il nuovo avatar
      await this.updateUserProfile(userId, {
        avatar: imageUrl,
        avatarFileId: uploadedFile.$id
      });

      console.log('✅ Profile updated with new avatar');
      return imageUrl;
    } catch (error) {
      console.error('❌ uploadProfileImage error:', error);
      throw error;
    }
  }

  async uploadStructureImage(userId: string, file: File): Promise<string> {
    try {
      console.log('📤 Uploading structure logo for:', userId);

      // Prima elimina l'eventuale vecchio logo
      await this.deleteOldStructureImage(userId);

      // Carica la nuova immagine
      const uploadedFile = await this.storage.createFile(
        APPWRITE_CONFIG.buckets.logos,
        ID.unique(),
        file
      );

      console.log('✅ Logo uploaded:', uploadedFile.$id);

      // Ottieni l'URL pubblico
      const imageUrl = this.getStructureImageUrl(uploadedFile.$id);

      // Aggiorna il profilo struttura con il nuovo logo
      await this.db.updateDocument(
        this.dbId,
        this.collections.structures,
        userId,
        {
          logo: imageUrl,
          logoFileId: uploadedFile.$id
        }
      );

      console.log('✅ Structure updated with new logo');
      return imageUrl;
    } catch (error) {
      console.error('❌ uploadStructureImage error:', error);
      throw error;
    }
  }

  getProfileImageUrl(fileId: string): string {
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
  }

  getStructureImageUrl(fileId: string): string {
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.logos}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
  }

  private async deleteOldProfileImage(userId: string) {
    try {
      const profile = await this.getUserProfile(userId);
      if (profile.avatarFileId) {
        await this.storage.deleteFile(
          APPWRITE_CONFIG.buckets.avatars,
          profile.avatarFileId
        );
        console.log('🗑️ Old avatar deleted');
      }
    } catch (error) {
      // Se non c'è un'immagine precedente, ignora l'errore
      console.log('No previous avatar to delete');
    }
  }

  private async deleteOldStructureImage(userId: string) {
    try {
      const profile = await this.getStructureProfile(userId);
      if (profile.logoFileId) {
        await this.storage.deleteFile(
          APPWRITE_CONFIG.buckets.logos,
          profile.logoFileId
        );
        console.log('🗑️ Old logo deleted');
      }
    } catch (error) {
      console.log('No previous logo to delete');
    }
  }
  // ==================== JOBS WITH STRUCTURE ====================

  async getJobsWithStructures(filters: { city?: string; role?: string; isActive?: boolean } = {}) {
    try {
      const queries = [Query.orderDesc('$createdAt')];

      if (filters.city) {
        queries.push(Query.equal('city', filters.city));
      }
      if (filters.role) {
        queries.push(Query.equal('role', filters.role));
      }
      if (filters.isActive !== undefined) {
        queries.push(Query.equal('isActive', filters.isActive));
      }

      const jobs = await this.db.listDocuments(
        this.dbId,
        this.collections.jobs,
        queries
      );

      // Carica i profili delle strutture per ogni lavoro
      const jobsWithStructures = [];
      for (const job of jobs.documents) {
        try {
          const structure = await this.getStructureProfile(job.structureId);
          jobsWithStructures.push({
            ...job,
            structure
          });
        } catch (error) {
          console.warn(`Could not load structure for job ${job.$id}`);
          jobsWithStructures.push({
            ...job,
            structure: null
          });
        }
      }

      return jobsWithStructures;
    } catch (error) {
      console.error('getJobsWithStructures error:', error);
      return [];
    }
  }

  async createJobPost(structureId: string, jobData: {
    title: string;
    description: string;
    role: string;
    requirements?: string[];
    qualificationsRequired?: string[];
    contractType: string;
    workingHours?: string;
    salaryMin?: number;
    salaryMax?: number;
    city: string;
    province: string;
    expiryDate: string;
  }) {
    try {
      console.log('📝 Creating job post for structure:', structureId);

      const job = await this.db.createDocument(
        this.dbId,
        this.collections.jobs,
        ID.unique(),
        {
          structureId,
          ...jobData,
          isActive: true,
          applicationsCount: 0
        }
      );

      console.log('✅ Job created:', job.$id);
      return job;
    } catch (error) {
      console.error('❌ createJobPost error:', error);
      throw error;
    }
  }



}

export const databaseService = new DatabaseService();
export type { CompleteUserProfile };