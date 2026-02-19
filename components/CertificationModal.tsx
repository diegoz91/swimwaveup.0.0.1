// src/components/CertificationModal.tsx
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { Certification } from '../types';

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (certification: Certification) => Promise<void>;
  certification?: Certification;
  mode: 'add' | 'edit';
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  certification,
  mode
}) => {
  const [formData, setFormData] = useState<Certification>({
    name: '',
    issuer: '',
    category: '',
    expiry: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Certification>>({});

  useEffect(() => {
    if (certification && mode === 'edit') {
      setFormData(certification);
    } else {
      setFormData({
        name: '',
        issuer: '',
        category: '',
        expiry: ''
      });
    }
    setErrors({});
  }, [certification, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Partial<Certification> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome della certificazione è obbligatorio';
    }
    
    if (!formData.issuer.trim()) {
      newErrors.issuer = 'L\'ente rilasciante è obbligatorio';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'La categoria è obbligatoria';
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
      console.error('Error saving certification:', error);
      alert('Errore nel salvare la certificazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Certification, value: string) => {
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
            {mode === 'add' ? 'Aggiungi Certificazione' : 'Modifica Certificazione'}
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
              Nome Certificazione *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="es. Brevetto di Assistente Bagnanti"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ente Rilasciante *
            </label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => handleChange('issuer', e.target.value)}
              placeholder="es. Federazione Italiana Nuoto"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.issuer ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.issuer && (
              <p className="text-red-500 text-sm mt-1">{errors.issuer}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleziona una categoria</option>
              <option value="salvamento">Salvamento</option>
              <option value="istruzione">Istruzione</option>
              <option value="sicurezza">Sicurezza</option>
              <option value="allenamento">Allenamento</option>
              <option value="specializzazione">Specializzazione</option>
              <option value="primo_soccorso">Primo Soccorso</option>
              <option value="manutenzione">Manutenzione</option>
              <option value="altro">Altro</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Scadenza
            </label>
            <input
              type="date"
              value={formData.expiry || ''}
              onChange={(e) => handleChange('expiry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Lascia vuoto se la certificazione non ha scadenza
            </p>
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