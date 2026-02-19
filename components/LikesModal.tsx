
import React from 'react';
import { LIKES, PROFESSIONALS } from '../src/utils/mockData';
import { Icon } from './Icon';

interface LikesModalProps {
    postId: number;
    onClose: () => void;
    onNavigate: (view: 'profile' | 'messages', id: number) => void;
}

export const LikesModal: React.FC<LikesModalProps> = ({ postId, onClose, onNavigate }) => {
    const likersIds = LIKES.filter(like => like.postId === postId).map(like => like.userId);
    const likers = PROFESSIONALS.filter(p => likersIds.includes(p.id));

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-800">Mi piace</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4">
                    {likers.length > 0 ? (
                        <div className="space-y-3">
                            {likers.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={user.avatarUrl} 
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                            onClick={() => { onClose(); onNavigate('profile', user.id); }}
                                        />
                                        <div>
                                            <p 
                                                className="font-bold text-slate-800 cursor-pointer hover:text-blue-600"
                                                onClick={() => { onClose(); onNavigate('profile', user.id); }}
                                            >
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-slate-500">{user.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { onClose(); onNavigate('messages', user.id); }} className="text-blue-600 font-semibold border border-blue-600 px-3 py-1 text-sm rounded-full hover:bg-blue-50">Messaggio</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">Nessun "Mi piace" ancora.</p>
                    )}
                </div>
            </div>
        </div>
    );
};