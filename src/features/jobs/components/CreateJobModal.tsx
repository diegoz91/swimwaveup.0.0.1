import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { databaseService } from '@/services/database';
import { useToast } from '@/context/ToastContext';
import type { StructureProfile } from '@/types/types';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJobCreated: () => void;
    structureId: string;
}

const initialFormState = {
    title: '',
    description: '',
    role: 'istruttore',
    contractType: 'full-time',
    city: '',
    province: '',
    salaryMin: '',
    salaryMax: '',
    workingHours: '',
    requirements: '',
    qualifications: '',
    expiryDays: '30'
};

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ 
    isOpen, 
    onClose, 
    onJobCreated,
    structureId 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && titleInputRef.current) {
            setTimeout(() => titleInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSafeClose = () => {
        const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormState);
        if (hasUnsavedChanges) {
            if (window.confirm("Hai dei dati non salvati. Sei sicuro di voler chiudere?")) {
                setFormData(initialFormState);
                onClose();
            }
        } else {
            onClose();
        }
    };

    const roles = [
        { value: 'istruttore', label: 'Istruttore di Nuoto' },
        { value: 'bagnino', label: 'Bagnino / Assistente Bagnanti' },
        { value: 'tecnico', label: 'Tecnico Manutentore' },
        { value: 'allenatore', label: 'Allenatore' },
        { value: 'coordinatore', label: 'Coordinatore' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'altro', label: 'Altro' }
    ];

    const contractTypes = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'stagionale', label: 'Stagionale' },
        { value: 'collaborazione', label: 'Collaborazione Sportiva' },
        { value: 'tirocinio', label: 'Tirocinio / Stage' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.description.trim() || !formData.city.trim()) {
            showToast('Compila tutti i campi obbligatori', 'error');
            return;
        }

        if (formData.salaryMin && formData.salaryMax && parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
            showToast('Lo stipendio minimo non può essere maggiore del massimo.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // 💡 FIX NOME STRUTTURA: Cerchiamo il nome e logo reale dal Database
            let sName = 'Struttura Non Specificata';
            let sLogo = '';
            try {
                const fac = await databaseService.getFacility(structureId);
                if (fac) { 
                    sName = fac.name; 
                    sLogo = fac.logo || ''; 
                } else {
                    const prof = await databaseService.getProfile(structureId) as StructureProfile;
                    if ('structureName' in prof) {
                        sName = prof.structureName || 'Struttura Non Specificata';
                        sLogo = prof.logo || '';
                    }
                }
            } catch(e) { console.error("Errore recupero nome struttura", e); }

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(formData.expiryDays));

            const reqsArray = formData.requirements.split('\n').map(r => r.trim()).filter(r => r.length > 0);
            const qualsArray = formData.qualifications.split('\n').map(q => q.trim()).filter(q => q.length > 0);

            await databaseService.createJob({
                structureId: structureId,
                structureName: sName, // 💡 Inserito!
                facilityLogo: sLogo,  // 💡 Inserito!
                title: formData.title.trim(),
                description: formData.description.trim(),
                role: formData.role,
                contractType: formData.contractType,
                city: formData.city.trim(),
                province: formData.province.trim().toUpperCase(),
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
                workingHours: formData.workingHours.trim(),
                requirements: reqsArray,
                qualificationsRequired: qualsArray,
                isActive: true,
            });

            showToast('Annuncio pubblicato con successo!', 'success');
            setFormData(initialFormState);
            onJobCreated();
            onClose();
            
        } catch (error) {
            console.error('Error creating job:', error);
            showToast("Errore durante la pubblicazione dell'annuncio. Riprova tra qualche istante.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
            onClick={handleSafeClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-800 flex-shrink-0">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Icon type="briefcase" className="w-6 h-6" />
                        </div>
                        Pubblica Annuncio
                    </h2>
                    <button 
                        onClick={handleSafeClose}
                        className="text-blue-100 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Chiudi modale"
                    >
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="job-title" className="block text-sm font-bold text-slate-700 mb-2">
                                Titolo dell'annuncio <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="job-title"
                                ref={titleInputRef}
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="es. Istruttore di Nuoto per corsi bambini"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="job-role" className="block text-sm font-bold text-slate-700 mb-2">
                                    Ruolo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="job-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="job-contract" className="block text-sm font-bold text-slate-700 mb-2">
                                    Tipo di contratto <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="job-contract"
                                    name="contractType"
                                    value={formData.contractType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                >
                                    {contractTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="job-city" className="block text-sm font-bold text-slate-700 mb-2">
                                    Città <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="job-city"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="es. Milano"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="job-province" className="block text-sm font-bold text-slate-700 mb-2">
                                    Provincia (Sigla)
                                </label>
                                <input
                                    id="job-province"
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    placeholder="es. MI"
                                    maxLength={2}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none uppercase"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="job-description" className="block text-sm font-bold text-slate-700 mb-2">
                                Descrizione del lavoro <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="job-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Descrivi le mansioni, l'ambiente di lavoro e cosa offrite..."
                                rows={5}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="job-salaryMin" className="block text-sm font-bold text-slate-700 mb-2 truncate">
                                    Stipendio min (€/mese)
                                </label>
                                <input
                                    id="job-salaryMin"
                                    type="number"
                                    name="salaryMin"
                                    min="0"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    placeholder="es. 1200"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="job-salaryMax" className="block text-sm font-bold text-slate-700 mb-2 truncate">
                                    Stipendio max (€/mese)
                                </label>
                                <input
                                    id="job-salaryMax"
                                    type="number"
                                    name="salaryMax"
                                    min="0"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    placeholder="es. 1800"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="job-hours" className="block text-sm font-bold text-slate-700 mb-2">
                                    Orario
                                </label>
                                <input
                                    id="job-hours"
                                    type="text"
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleChange}
                                    placeholder="es. Turni / 20h"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="job-requirements" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Icon type="check-double" className="w-4 h-4 text-green-600"/>
                                    Requisiti
                                </label>
                                <textarea
                                    id="job-requirements"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    placeholder="1 requisito per riga&#10;es. Esperienza pregressa&#10;Disponibilità weekend"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="job-qualifications" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Icon type="certificate" className="w-4 h-4 text-blue-600"/>
                                    Brevetti/Qualifiche
                                </label>
                                <textarea
                                    id="job-qualifications"
                                    name="qualifications"
                                    value={formData.qualifications}
                                    onChange={handleChange}
                                    placeholder="1 qualifica per riga&#10;es. Brevetto Istruttore FIN&#10;Brevetto Salvamento"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                            <label htmlFor="job-expiry" className="block text-sm font-bold text-blue-900 mb-2">
                                Scadenza annuncio
                            </label>
                            <select
                                id="job-expiry"
                                name="expiryDays"
                                value={formData.expiryDays}
                                onChange={handleChange}
                                className="w-full sm:w-1/2 px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 outline-none"
                            >
                                <option value="7">Tra 7 giorni</option>
                                <option value="14">Tra 14 giorni</option>
                                <option value="30">Tra 30 giorni (Consigliato)</option>
                                <option value="60">Tra 60 giorni</option>
                            </select>
                            <p className="text-xs text-blue-600 mt-2">L'annuncio verrà rimosso automaticamente alla scadenza per mantenere la bacheca pulita.</p>
                        </div>
                    </div>

                    <div className="sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-white z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button
                            type="button"
                            onClick={handleSafeClose}
                            className="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Pubblicazione...
                                </>
                            ) : (
                                <>
                                    <Icon type="send" className="w-5 h-5" />
                                    Pubblica Annuncio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};