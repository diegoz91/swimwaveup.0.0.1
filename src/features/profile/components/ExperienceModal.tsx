import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Experience } from '@/types/types';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: Experience) => Promise<void>;
  experience?: Experience;
  mode: 'add' | 'edit';
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  experience,
  mode
}) => {
  const [formData, setFormData] = useState<Experience>({
    role: '',
    facility: '',
    period: '',
    description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (experience && mode === 'edit') {
      setFormData(experience);
    } else {
      setFormData({ role: '', facility: '', period: '', description: '' });
    }
  }, [experience, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.facility.trim() || !formData.period.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Errore salvataggio esperienza:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Icon type="briefcase" className="w-6 h-6 text-blue-600" />
            {mode === 'add' ? 'Aggiungi Esperienza' : 'Modifica Esperienza'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <Icon type="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ruolo ricoperto <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="es. Istruttore di Nuoto Base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Struttura / Società <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.facility}
              onChange={e => setFormData({ ...formData, facility: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="es. Piscina Comunale"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Periodo <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.period}
              onChange={e => setFormData({ ...formData, period: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="es. Set 2020 - Attuale"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrizione mansioni (Opzionale)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
              placeholder="Descrivi brevemente di cosa ti occupavi..."
            />
          </div>

          <div className="flex space-x-3 pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Icon type={mode === 'add' ? 'plus' : 'check-double'} className="w-4 h-4" />
                  {mode === 'add' ? 'Aggiungi' : 'Salva Modifiche'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};