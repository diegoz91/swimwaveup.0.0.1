import React, { useMemo } from 'react';
import type { UserProfile, StructureProfile } from '../types';
import { Icon } from './Icon';

interface ProfileCardProps {
  user: UserProfile | StructureProfile;
  onSelectProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSelectProfile }) => {
  const { name, title, avatarUrl, location } = useMemo(() => {
    const isProfessional = user.userType === 'professional';
    
    let extractedName = 'Utente';
    if (isProfessional) {
        extractedName = `${(user as UserProfile).firstName || ''} ${(user as UserProfile).lastName || ''}`.trim() || 'Utente';
    } else {
        extractedName = (user as StructureProfile).structureName || 'Struttura';
    }

    const extractedTitle = isProfessional 
        ? ((user as UserProfile).title || 'Professionista') 
        : ((user as StructureProfile).structureType || 'Centro Acquatico');

    const extractedLocation = user.city ? `${user.city}${user.province ? ` (${user.province})` : ''}` : 'Sede non specificata';
    
    const rawAvatar = isProfessional ? (user as UserProfile).avatar : (user as StructureProfile).logo;
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(extractedName)}&background=eff6ff&color=1d4ed8`;

    return {
        name: extractedName,
        title: extractedTitle,
        avatarUrl: rawAvatar || fallbackAvatar,
        location: extractedLocation
    };
  }, [user]);

  const bgSeed = user.$id || user.userId || 'default';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center overflow-hidden group">
        <div 
            className="h-24 bg-slate-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url(https://picsum.photos/seed/bg${bgSeed}/400/150)` }}
        ></div>
        
        <div className="p-5 -mt-12 relative z-10 bg-white/5 backdrop-blur-sm pt-0">
            <img 
                src={avatarUrl} 
                alt={`Avatar di ${name}`} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform bg-white"
                onClick={onSelectProfile}
                loading="lazy"
            />
            
            <h3 
                className="text-lg sm:text-xl font-extrabold mt-3 text-slate-800 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1 leading-tight px-2"
                onClick={onSelectProfile}
                title={name}
            >
                {name}
            </h3>
            
            <p className="text-slate-500 text-sm font-medium mt-1 line-clamp-2 min-h-[40px] px-2" title={title}>
                {title}
            </p>
            
            <div className="border-t border-slate-100 mt-5 mb-4"></div>
            
            <div className="text-left space-y-3 text-slate-600 text-sm font-medium px-2">
                <div className="flex items-center group/item">
                    <div className="w-8 flex justify-center">
                        <Icon type="location" className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                    </div>
                    <span className="truncate">{location}</span>
                </div>
                <div className="flex items-center justify-between group/item cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors" onClick={onSelectProfile}>
                    <div className="flex items-center">
                        <div className="w-8 flex justify-center">
                            <Icon type="users" className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                        </div>
                        <span>Collegamenti</span>
                    </div>
                    <span className="font-bold text-blue-600">
                        {(user as any).connections?.length || 0}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};