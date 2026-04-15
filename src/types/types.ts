import { Models } from 'appwrite';

export type AppwriteDocument = Models.Document;
export type UserType = 'professional' | 'structure';

export interface Certification {
  name: string;
  issuer: string;
  category: string;
  expiry?: string;
}

export interface Experience {
  role: string;
  facility: string;
  period: string;
  description: string;
}

export interface Media {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

// ----------------------------------------------------
// 1. PROFILES COLLECTION
// ----------------------------------------------------
export interface BaseProfile extends AppwriteDocument {
  userId: string;
  userType: UserType;
  email: string;
  bio?: string;
  city?: string;
  province?: string;
  connections?: string[];
  typingTo?: string | null;
  readReceipts?: boolean;
  isOnline?: boolean;
  lastActive?: string;
}

export interface UserProfile extends BaseProfile {
  userType: 'professional';
  firstName?: string;
  lastName?: string;
  title?: string;
  avatar?: string;
  experienceList?: string[];
  certificationsList?: string[];
  availableForEmergencies?: boolean;
  managedFacilities?: string[]; 
}

export interface StructureProfile extends BaseProfile {
  userType: 'structure';
  structureName?: string;
  structureType?: string;
  logo?: string;
}

export type AuthenticatedUser = Models.User<Models.Preferences> & (UserProfile | StructureProfile);

// ----------------------------------------------------
// 2. POSTS COLLECTION
// ----------------------------------------------------
export interface Post extends AppwriteDocument {
  authorId: string;
  authorType: UserType;
  content: string;
  postType: 'text' | 'image' | 'video' | 'link';
  media?: Media[];
  category?: string;
  visibility: 'public' | 'connections_only';
  likesCount: number;
  commentsCount: number;
}

export interface EnrichedPost extends Post {
    recommendedBy?: { id: string; name: string };
}

// ----------------------------------------------------
// 3. COMMENTS & LIKES
// ----------------------------------------------------
export interface Comment extends AppwriteDocument {
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface Like extends AppwriteDocument {
  postId: string;
  userId: string;
}

// ----------------------------------------------------
// 4. JOBS & APPLICATIONS
// ----------------------------------------------------
export interface Job extends AppwriteDocument {
  structureId: string;
  title: string;
  description: string;
  role: string;
  contractType?: string;
  city: string;
  province?: string;
  salaryMin?: number;
  salaryMax?: number;
  workingHours?: string;
  isActive: boolean;
  structureName?: string; 
  facilityLogo?: string;
  candidates?: string[];
  requirements?: string[];
  qualificationsRequired?: string[];
  
  isSOS?: boolean;
  sosDate?: string;
  sosShift?: string;
}

export interface Application extends AppwriteDocument {
  jobId: string;
  applicantId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'hired';
  coverLetter?: string;
}

// ----------------------------------------------------
// 5. CONNECTIONS & MESSAGES
// ----------------------------------------------------
export interface Connection extends AppwriteDocument {
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message extends AppwriteDocument {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
}

// ----------------------------------------------------
// 6. SWIM-SQUAD (GESTIONE TEAM)
// ----------------------------------------------------
export interface SquadAnnouncement extends AppwriteDocument {
  structureId: string;
  content: string;
  isImportant: boolean;
  readBy: string[];
}

export interface SquadShift extends AppwriteDocument {
  structureId: string;
  userId: string;
  userName: string;
  date: string;
  shiftTime: string;
  role: string;
  status: 'scheduled' | 'completed' | 'sos';
}

// ----------------------------------------------------
// 7. FACILITIES (PAGINE AZIENDALI - MODELLO LINKEDIN)
// ----------------------------------------------------
export interface Facility extends AppwriteDocument {
  name: string;
  type?: string;
  city: string;
  province?: string;
  bio?: string;
  logo?: string;
  cover?: string;
  admins: string[];     
  staff: string[];      
  followers: string[];  
}

// ----------------------------------------------------
// 8. NOTIFICATIONS (CENTRO NOTIFICHE)
// ----------------------------------------------------
export interface AppNotification extends AppwriteDocument {
  userId: string;
  type: 'connection' | 'hired' | 'rejected' | 'general';
  content: string;
  relatedId?: string; // ID Struttura o Utente
  isRead: boolean;
}