import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { Experience } from '../types';

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
  const [errors, setErrors] = useState<Partial<Experience>>({});

  useEffect(() => {
    if (experience && mode === 'edit') {
      setFormData(experience);
    } else {
      setFormData({
        role: '',
        facility: '',
        period: '',
        description: ''
      });
    }
    setErrors({});
  }, [experience, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Partial<Experience> = {};
    
    if (!formData.role.trim()) newErrors.role = 'Il ruolo è obbligatorio';
    if (!formData.facility.trim()) newErrors.facility = 'La struttura è obbligatoria';
    if (!formData.period.trim()) newErrors.period = 'Il periodo è obbligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descrizione è obbligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert("Errore nel salvare l'esperienza. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Experience, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 id="modal-title" className="text-xl font-extrabold text-slate-800">
            {mode === 'add' ? 'Aggiungi Esperienza' : 'Modifica Esperienza'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
            aria-label="Chiudi modale"
          >
            <Icon type="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Campo Ruolo */}
          <div>
            <label htmlFor="exp-role" className="block text-sm font-bold text-slate-700 mb-1.5">
              Ruolo <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-role"
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="es. Istruttore di Nuoto Senior"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.role ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.role && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.role}</p>}
          </div>

          {/* Campo Struttura */}
          <div>
            <label htmlFor="exp-facility" className="block text-sm font-bold text-slate-700 mb-1.5">
              Struttura <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-facility"
              type="text"
              value={formData.facility}
              onChange={(e) => handleChange('facility', e.target.value)}
              placeholder="es. Piscina Comunale Milano"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.facility ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.facility && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.facility}</p>}
          </div>

          {/* Campo Periodo */}
          <div>
            <label htmlFor="exp-period" className="block text-sm font-bold text-slate-700 mb-1.5">
              Periodo <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-period"
              type="text"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              placeholder="es. Set 2022 - Presente"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.period ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.period && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.period}</p>}
          </div>

          {/* Campo Descrizione */}
          <div>
            <label htmlFor="exp-description" className="block text-sm font-bold text-slate-700 mb-1.5">
              Descrizione <span className="text-red-500">*</span>
            </label>
            <textarea
              id="exp-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrivi le tue responsabilità e i traguardi raggiunti..."
              rows={4}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.description}</p>}
          </div>

          {/* Footer Form */}
          <div className="flex space-x-3 pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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