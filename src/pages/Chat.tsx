import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MessagesView } from '@/features/messaging/components/MessagesView';

const Chat: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleProfileClick = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="pt-20 md:pt-24 px-0 md:px-4 max-w-7xl mx-auto w-full h-screen md:h-auto overflow-hidden animate-in fade-in duration-500">
            <MessagesView 
                currentUserId={user.$id} 
                onProfileClick={handleProfileClick}
            />
        </div>
    );
};

export default Chat;