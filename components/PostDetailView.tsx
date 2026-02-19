
import React from 'react';
import type { MockPost, Post } from '../types';
import { PostCard } from './PostCard';
import { Comment } from './Comment';
import { Icon } from './Icon';
import { CURRENT_USER_ID, PROFESSIONALS } from '../src/utils/mockData';

interface PostDetailViewProps {
  post: MockPost;
  onBack: () => void;
  onSelectProfile: (id: number) => void;
}

// Adapter to convert MockPost to the Post type expected by PostCard
const adaptMockPostToPost = (mockPost: MockPost): Post => {
    return {
        $id: String(mockPost.id),
        authorId: String(mockPost.authorId),
        authorType: 'professional', // Assumption for mock data
        content: mockPost.content,
        postType: mockPost.media && mockPost.media.length > 0 ? 'image' : 'text',
        mediaUrls: mockPost.media?.map(m => m.url) || [],
        visibility: 'public',
        likesCount: mockPost.likes,
        commentsCount: mockPost.comments.length,
        sharesCount: mockPost.shares,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $collectionId: 'mock-collection',
        $databaseId: 'mock-database',
        $permissions: [],
        $sequence: 0,
    };
};


export const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack, onSelectProfile }) => {
    const currentUser = PROFESSIONALS.find(p => p.id === CURRENT_USER_ID)!;
    const adaptedPost = adaptMockPostToPost(post);

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Torna al feed</button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <PostCard post={adaptedPost} onNavigate={(view, id) => onSelectProfile(id!)} />

                <div className="p-4 border-t border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Commenti ({post.comments.length})</h2>
                    
                    {/* New Comment Input */}
                    <div className="flex items-start space-x-3 mb-6">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                             <textarea 
                                placeholder="Aggiungi un commento..."
                                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                            />
                            <div className="flex justify-end mt-2">
                                <button className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-full hover:bg-blue-700 transition text-sm">
                                    Pubblica
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {post.comments.map(comment => (
                            <Comment key={comment.id} comment={comment} onSelectProfile={onSelectProfile} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};