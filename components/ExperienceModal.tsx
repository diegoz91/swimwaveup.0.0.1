// src/components/ExperienceModal.tsx
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
    
    if (!formData.role.trim()) {
      newErrors.role = 'Il ruolo è obbligatorio';
    }
    
    if (!formData.facility.trim()) {
      newErrors.facility = 'La struttura è obbligatoria';
    }
    
    if (!formData.period.trim()) {
      newErrors.period = 'Il periodo è obbligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    }
    
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
      alert('Errore nel salvare l\'esperienza. Riprova.');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Aggiungi Esperienza' : 'Modifica Esperienza'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon type="x" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ruolo *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="es. Istruttore di Nuoto Senior"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Struttura *
            </label>
            <input
              type="text"
              value={formData.facility}
              onChange={(e) => handleChange('facility', e.target.value)}
              placeholder="es. Piscina Comunale Milano"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.facility ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.facility && (
              <p className="text-red-500 text-sm mt-1">{errors.facility}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo *
            </label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              placeholder="es. 2022 - Presente"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.period ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.period && (
              <p className="text-red-500 text-sm mt-1">{errors.period}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrivi le tue responsabilità e competenze in questo ruolo..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? 'Salvando...' : (mode === 'add' ? 'Aggiungi' : 'Salva')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};