import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Certification } from '@/types/types';

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

  useEffect(() => {
    if (certification && mode === 'edit') {
      setFormData(certification);
    } else {
      setFormData({ name: '', issuer: '', category: '', expiry: '' });
    }
  }, [certification, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuer.trim() || !formData.category.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Errore salvataggio certificazione:', error);
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
            <Icon type="certificate" className="w-6 h-6 text-blue-600" />
            {mode === 'add' ? 'Aggiungi Certificazione' : 'Modifica Certificazione'}
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Certificazione <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="es. Brevetto Istruttore Base"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ente Rilasciante <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.issuer}
                onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="es. FIN"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoria <span className="text-red-500">*</span></label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Seleziona categoria...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.label}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Data di Scadenza (Opzionale)</label>
            <input
              type="date"
              value={formData.expiry || ''}
              onChange={e => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Icon type="info" className="w-3 h-3" />
              Lascia vuoto se la certificazione non scade.
            </p>
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