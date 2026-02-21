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

const CATEGORIES = [
  { value: 'salvamento', label: 'Salvamento' },
  { value: 'istruzione', label: 'Istruzione' },
  { value: 'sicurezza', label: 'Sicurezza' },
  { value: 'allenamento', label: 'Allenamento' },
  { value: 'specializzazione', label: 'Specializzazione' },
  { value: 'primo_soccorso', label: 'Primo Soccorso' },
  { value: 'manutenzione', label: 'Manutenzione' },
  { value: 'altro', label: 'Altro' },
] as const;

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
    
    if (!formData.name.trim()) newErrors.name = 'Il nome della certificazione è obbligatorio';
    if (!formData.issuer.trim()) newErrors.issuer = "L'ente rilasciante è obbligatorio";
    if (!formData.category.trim()) newErrors.category = 'La categoria è obbligatoria';
    
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
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 id="modal-title" className="text-xl font-extrabold text-slate-800">
            {mode === 'add' ? 'Aggiungi Certificazione' : 'Modifica Certificazione'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
            aria-label="Chiudi modale"
          >
            <Icon type="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Campo Nome */}
          <div>
            <label htmlFor="cert-name" className="block text-sm font-bold text-slate-700 mb-1.5">
              Nome Certificazione <span className="text-red-500">*</span>
            </label>
            <input
              id="cert-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="es. Brevetto di Assistente Bagnanti"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.name}</p>}
          </div>

          {/* Campo Ente */}
          <div>
            <label htmlFor="cert-issuer" className="block text-sm font-bold text-slate-700 mb-1.5">
              Ente Rilasciante <span className="text-red-500">*</span>
            </label>
            <input
              id="cert-issuer"
              type="text"
              value={formData.issuer}
              onChange={(e) => handleChange('issuer', e.target.value)}
              placeholder="es. Federazione Italiana Nuoto"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.issuer ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.issuer && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.issuer}</p>}
          </div>

          {/* Campo Categoria */}
          <div>
            <label htmlFor="cert-category" className="block text-sm font-bold text-slate-700 mb-1.5">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="cert-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.category ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            >
              <option value="" disabled>Seleziona una categoria</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.category}</p>}
          </div>

          {/* Campo Scadenza */}
          <div>
            <label htmlFor="cert-expiry" className="block text-sm font-bold text-slate-700 mb-1.5">
              Data Scadenza
            </label>
            <input
              id="cert-expiry"
              type="date"
              value={formData.expiry || ''}
              onChange={(e) => handleChange('expiry', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Icon type="info" className="w-3 h-3" />
              Lascia vuoto se la certificazione non scade.
            </p>
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
                  Salvataggio...
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