// types.ts
import { Models } from 'appwrite';

// Base Appwrite Document
export type AppwriteDocument = Models.Document;

// From 'users' collection
export interface UserProfile extends AppwriteDocument {
  userId: string;
  userType: 'professional';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;           // URL dell'immagine profilo
  avatarFileId?: string;     // ✅ NUOVO: ID del file su Appwrite Storage
  bio?: string;
  city: string;
  province: string;
  qualifications?: string[];
  experience?: number;
  experienceList?: Experience[];      // ✅ Lista esperienza deserializzata
  certificationsList?: Certification[]; // ✅ Lista certificazioni deserializzata
  isActive: boolean;
  lastSeen?: string; // datetime
  connectionCount?: number;
}

// From 'structures' collection
export interface StructureProfile extends AppwriteDocument {
  userId: string;
  userType: 'structure';
  structureName: string;
  structureType: string;
  vatNumber: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;            // URL del logo
  logoFileId?: string;      // ✅ NUOVO: ID del file su Appwrite Storage
  description?: string;
  services?: string[];
  openingHours?: string;
  poolsCount?: number;
  isVerified: boolean;
}

// Combined user type for authentication context
export type AuthenticatedUser = Models.User<Models.Preferences> & {
  userType?: 'professional' | 'structure';
  firstName?: string;
  lastName?: string;
  structureName?: string;
  avatar?: string;
  avatarFileId?: string;
  logo?: string;
  logoFileId?: string;
  city?: string;
  province?: string;
  bio?: string;
  qualifications?: string[];
  experienceList?: Experience[];
  certificationsList?: Certification[];
  connectionCount?: number;
};

// From 'posts' collection
export interface Post extends AppwriteDocument {
  authorId: string;
  authorType: 'professional' | 'structure';
  content: string;
  postType: 'text' | 'image' | 'video' | 'job_offer';
  mediaUrls?: string[];
  hashtags?: string[];
  visibility: 'public' | 'connections';
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

// From 'jobs' collection
export interface Job extends AppwriteDocument {
  structureId: string;
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
  startDate?: string; // datetime
  expiryDate: string; // datetime
  isActive: boolean;
  applicationsCount?: number;
  structureName?: string; 
}

// From 'applications' collection
export interface Application extends AppwriteDocument {
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  customMessage?: string;
  documents?: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  availability?: string;
  expectedSalary?: string;
  appliedAt: string; // datetime
  reviewedAt?: string; // datetime
}

// From 'connections' collection
export interface Connection extends AppwriteDocument {
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  requestedAt: string; // datetime
  acceptedAt?: string; // datetime
}

// From 'messages' collection
export interface Message extends AppwriteDocument {
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string;
  isRead: boolean;
  conversationId: string;
  sentAt: string; // datetime
  readAt?: string; // datetime
}

// --- Types for mock data and components ---

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

export interface ProfessionalUser {
  id: number;
  userId?: string;  // ✅ NUOVO: ID Appwrite per collegamento
  name: string;
  title: string;
  location: string;
  avatarUrl: string;
  specializations: string[];
  certifications: Certification[];
  experience: Experience[];
  connections: number;
  bio: string;
  email: string;
  phone: string;
}

export interface MockJob {
  id: number;
  title: string;
  facilityId: number;
  facilityName: string;
  facilityLogo: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary: string;
  postedOn: string;
}

export interface AquaticFacility {
  id: number;
  name: string;
  type: string;
  location: string;
  logoUrl: string;
  services: string[];
  features: string[];
  openPositions: MockJob[];
  about: string;
  images: string[];
}

export interface MockComment {
    id: number;
    authorId: number;
    content: string;
    timestamp: string;
    likes: number;
    replies?: MockComment[];
}

export interface Media {
    type: 'image' | 'video';
    url: string;
    alt?: string;
}

export interface MockPost {
    id: number;
    authorId: number;
    authorName: string;
    authorAvatar: string;
    authorTitle: string;
    timestamp: string;
    content: string;
    media?: Media[];
    likes: number;
    shares: number;
    comments: MockComment[];
}

export interface MockMessage {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  status: 'read' | 'delivered' | 'sent';
}

export interface Conversation {
    id: number;
    participantId: number;
    unreadCount: number;
    messages: MockMessage[];
}

export interface ConnectionRequest {
    id: number;
    fromUserId: number;
}

export interface NetworkUpdate {
    id: number;
    userId: number;
    text: string;
    timestamp: string;
}

export interface Like {
    postId: number;
    userId: number;
}

export interface MockApplication {
    id: number;
    jobId: number;
    userId: number;
    status: 'in revisione' | 'inviata' | 'accettata' | 'rifiutata';
    submittedOn: string;
    type: 'rapida' | 'personalizzata';
}

export type View = 'dashboard' | 'profile' | 'facility' | 'lavoro' | 'jobDetail' | 'messages' | 'network' | 'postDetail' | 'myApplications' | 'settings';

export type ApplicationFlowState = {
    step: 'idle' | 'requirements' | 'type' | 'rapid' | 'custom_analysis' | 'custom_letter' | 'custom_docs' | 'custom_availability' | 'custom_final' | 'custom_preview' | 'confirmation';
    job: Job | MockJob | null;
};

export type CustomApplicationSteps = 'custom_analysis' | 'custom_letter' | 'custom_docs' | 'custom_availability' | 'custom_final' | 'custom_preview';

// --- Prop Types ---
export interface HeaderProps {
    currentUser: AuthenticatedUser;
    onNavigate: (view: View, id?: string | number) => void;
    unreadMessages: number;
    connectionRequests: number;
}