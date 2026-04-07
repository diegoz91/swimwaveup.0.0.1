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
}

export interface UserProfile extends BaseProfile {
  userType: 'professional';
  firstName?: string;
  lastName?: string;
  title?: string;
  avatar?: string;
  experienceList?: string[];
  certificationsList?: string[];
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
  visibility: 'public' | 'connections_only';
  likesCount: number;
  commentsCount: number;
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
  isActive: boolean;
  structureName?: string; 
  facilityLogo?: string;
  candidates?: string[];
}

export interface Application extends AppwriteDocument {
  jobId: string;
  applicantId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
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