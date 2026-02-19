import React, { useState } from 'react';
import { Icon } from './Icon';
import { databaseService } from '../src/services/database';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJobCreated: () => void;
    structureId: string;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ 
    isOpen, 
    onClose, 
    onJobCreated,
    structureId 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
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
    });

    const roles = [
        { value: 'istruttore', label: 'Istruttore di Nuoto' },
        { value: 'bagnino', label: 'Bagnino' },
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
        { value: 'collaborazione', label: 'Collaborazione' },
        { value: 'tirocinio', label: 'Tirocinio' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.city) {
            alert('Compila tutti i campi obbligatori');
            return;
        }

        setIsSubmitting(true);

        try {
            // Calcola data di scadenza
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(formData.expiryDays));

            // Prepara i requisiti come array
            const requirements = formData.requirements
                .split('\n')
                .map(r => r.trim())
                .filter(r => r.length > 0);

            const qualifications = formData.qualifications
                .split('\n')
                .map(q => q.trim())
                .filter(q => q.length > 0);

            await databaseService.createJobPost(structureId, {
                title: formData.title,
                description: formData.description,
                role: formData.role,
                contractType: formData.contractType,
                city: formData.city,
                province: formData.province,
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
                workingHours: formData.workingHours || undefined,
                requirements: requirements.length > 0 ? requirements : undefined,
                qualificationsRequired: qualifications.length > 0 ? qualifications : undefined,
                expiryDate: expiryDate.toISOString()
            });

            // Reset form e chiudi
            setFormData({
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
            });

            onJobCreated();
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Errore durante la pubblicazione dell\'annuncio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icon type="briefcase" className="w-6 h-6" />
                        Pubblica Annuncio di Lavoro
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-1 transition"
                    >
                        <Icon type="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        {/* Titolo */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Titolo dell'annuncio *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="es. Istruttore di Nuoto per corsi bambini"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Ruolo e Contratto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Ruolo *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Tipo di contratto *
                                </label>
                                <select
                                    name="contractType"
                                    value={formData.contractType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {contractTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Località */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Città *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="es. Milano"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Provincia
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    placeholder="es. MI"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Descrizione */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Descrizione del lavoro *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Descrivi il ruolo, le responsabilità e l'ambiente di lavoro..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                required
                            />
                        </div>

                        {/* Stipendio e Orari */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Stipendio min (€/mese)
                                </label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    placeholder="es. 1200"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Stipendio max (€/mese)
                                </label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    placeholder="es. 1800"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Orario di lavoro
                                </label>
                                <input
                                    type="text"
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleChange}
                                    placeholder="es. 20h/settimana"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Requisiti */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Requisiti (uno per riga)
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="Brevetto di Bagnino&#10;Esperienza minima 1 anno&#10;Disponibilità weekend"
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>

                        {/* Qualifiche */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Qualifiche richieste (una per riga)
                            </label>
                            <textarea
                                name="qualifications"
                                value={formData.qualifications}
                                onChange={handleChange}
                                placeholder="Istruttore FIN&#10;Brevetto Salvamento"
                                rows={2}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>

                        {/* Durata annuncio */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Durata annuncio
                            </label>
                            <select
                                name="expiryDays"
                                value={formData.expiryDays}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="7">7 giorni</option>
                                <option value="14">14 giorni</option>
                                <option value="30">30 giorni</option>
                                <option value="60">60 giorni</option>
                                <option value="90">90 giorni</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer con bottoni */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition"
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Pubblicazione...
                                </>
                            ) : (
                                <>
                                    <Icon type="send" className="w-4 h-4" />
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