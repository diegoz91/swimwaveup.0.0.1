import React from 'react';
import type { ProfessionalUser } from '../types';
import { Icon } from './Icon';

interface ProfileCardProps {
  user: ProfessionalUser;
  onSelectProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSelectProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow-md text-center overflow-hidden">
        <div className="h-20 bg-blue-500"></div>
        <div className="p-4 -mt-12">
            <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg cursor-pointer"
                onClick={onSelectProfile}
            />
            <h3 
                className="text-xl font-bold mt-2 text-slate-800 cursor-pointer hover:text-blue-600"
                onClick={onSelectProfile}
            >
                {user.name}
            </h3>
            <p className="text-slate-500 text-sm">{user.title}</p>
            <div className="border-t border-slate-200 my-4"></div>
            <div className="text-left space-y-2 text-slate-600 text-sm">
                <div className="flex items-center">
                    <Icon type="location" className="w-5 h-5 mr-2 text-slate-400" />
                    <span>{user.location}</span>
                </div>
                 <div className="flex items-center">
                    <Icon type="users" className="w-5 h-5 mr-2 text-slate-400" />
                    <span>{user.connections} collegamenti</span>
                </div>
            </div>
        </div>
    </div>
  );
};