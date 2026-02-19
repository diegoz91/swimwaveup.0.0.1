
import React from 'react';
import type { MockComment } from '../types';
import { PROFESSIONALS } from '../src/utils/mockData';
import { Icon } from './Icon';

interface CommentProps {
    comment: MockComment;
    onSelectProfile: (id: number) => void;
}

export const Comment: React.FC<CommentProps> = ({ comment, onSelectProfile }) => {
    const author = PROFESSIONALS.find(p => p.id === comment.authorId);

    if (!author) return null;

    return (
        <div className="flex items-start space-x-3">
            <img 
                src={author.avatarUrl}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => onSelectProfile(author.id)}
            />
            <div className="flex-1">
                <div className="bg-slate-100 rounded-xl p-3">
                    <p 
                        className="font-bold text-slate-800 text-sm cursor-pointer"
                        onClick={() => onSelectProfile(author.id)}
                    >
                        {author.name}
                    </p>
                    <p className="text-xs text-slate-500 mb-1">{author.title}</p>
                    <p className="text-slate-700 text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1 px-2">
                    <span className="font-semibold hover:underline cursor-pointer">Mi piace</span>
                    <span className="font-semibold hover:underline cursor-pointer">Rispondi</span>
                    <span>{comment.timestamp}</span>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                     <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-200">
                        {comment.replies.map(reply => (
                            <Comment key={reply.id} comment={reply} onSelectProfile={onSelectProfile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};