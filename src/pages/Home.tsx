import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../services/database';
import { PostCard } from '../../components/PostCard';
import { CreatePostModal } from '../../components/CreatePostModal';
import type { Post, Media, ProfessionalUser } from '../../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Converte l'utente autenticato in ProfessionalUser per il modal
  const mockUser: ProfessionalUser = {
    id: parseInt(user?.$id || '0'),
    name: user?.userType === 'professional' 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.structureName || 'User',
    title: 'Professionista del Nuoto',
    location: user?.userType === 'professional' 
      ? `${user.city}, ${user.province}` 
      : 'Location',
    avatarUrl: user?.userType === 'professional' 
      ? user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=3b82f6&color=fff`
      : user?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.structureName || 'User')}&background=3b82f6&color=fff`,
    specializations: [],
    certifications: [],
    experience: [],
    connections: 0,
    bio: '',
    email: user?.email || '',
    phone: ''
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await databaseService.getFeedPosts();
        setPosts(response.documents as Post[]);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError("Impossibile caricare i post. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async (content: string, media: Media[]) => {
    if (!user) return;
    
    try {
      const authorType = user.userType === 'professional' ? 'professional' : 'structure';
      const postData = {
        authorId: user.$id,
        authorType,
        content: content.trim(),
        postType: media.length > 0 ? 'image' : 'text',
        mediaUrls: media.map(m => m.url),
        visibility: 'public',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0
      };
      
      const createdPost = await databaseService.createPost(postData);
      const formattedPost: Post = {
        $id: createdPost.$id,
        $createdAt: createdPost.$createdAt,
        $updatedAt: createdPost.$updatedAt,
        $permissions: createdPost.$permissions,
        $collectionId: createdPost.$collectionId,
        $databaseId: createdPost.$databaseId,
        authorId: createdPost.authorId,
        authorType: createdPost.authorType,
        content: createdPost.content,
        postType: createdPost.postType,
        mediaUrls: createdPost.mediaUrls || [],
        hashtags: createdPost.hashtags || [],
        visibility: createdPost.visibility,
        likesCount: createdPost.likesCount || 0,
        commentsCount: createdPost.commentsCount || 0,
        sharesCount: createdPost.sharesCount || 0
      };
      
      setPosts(prevPosts => [formattedPost, ...prevPosts]);
      setShowCreateModal(false);
      console.log('Post created successfully:', formattedPost);
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Errore nella creazione del post. Riprova.');
    }
  };

  const handleQuickCreatePost = () => {
    setShowCreateModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card card-comfortable text-center">
          <div className="btn-loading" style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4) auto' }}></div>
          <p className="card-description">Caricamento feed SwimWaveUp...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card card-error card-comfortable text-center">
          <h3 className="card-title">Errore</h3>
          <p className="card-description">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-md">
            Ricarica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {/* Quick Create Post Card */}
      {user && (
        <div className="card card-post card-comfortable" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <img
              src={mockUser.avatarUrl}
              alt={mockUser.name}
              className="card-post-avatar"
            />
            <button
              onClick={handleQuickCreatePost}
              className="btn btn-ghost"
              style={{ 
                flex: 1, 
                textAlign: 'left', 
                backgroundColor: 'var(--color-neutral-100)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-neutral-500)'
              }}
            >
              Cosa vuoi condividere oggi?
            </button>
          </div>
          <div className="card-post-actions">
            <button onClick={handleQuickCreatePost} className="card-post-action">
              <span>📷</span> Foto
            </button>
            <button onClick={handleQuickCreatePost} className="card-post-action">
              <span>🎥</span> Video
            </button>
            <button onClick={handleQuickCreatePost} className="card-post-action">
              <span>📝</span> Articolo
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard key={post.$id} post={post} />
        ))
      ) : (
        <div className="card card-comfortable text-center">
          <h3 className="card-title">Benvenuto in SwimWaveUp!</h3>
          <p className="card-description">Il feed è vuoto. Sii il primo a condividere un aggiornamento!</p>
          <button onClick={handleQuickCreatePost} className="btn btn-primary btn-lg">
            Crea il tuo primo post
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        user={mockUser}
      />
    </div>
  );
};

export default Home;