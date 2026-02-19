
import React, { useState, useMemo } from 'react';
import type { ProfessionalUser, Job, MockJob, View, ApplicationFlowState, CustomApplicationSteps } from '../types';
import { Icon } from './Icon';

interface ApplicationFlowModalProps {
    user: ProfessionalUser;
    job: MockJob;
    flowState: ApplicationFlowState;
    setFlowState: React.Dispatch<React.SetStateAction<ApplicationFlowState>>;
    onSubmit: (applicationType: 'rapida' | 'personalizzata') => void;
    onNavigate: (view: View, id?: number) => void;
}

// Internal state for the custom application form
const initialCustomData = {
    coverLetter_interest: '',
    coverLetter_specialization: '',
    useProfileCv: true,
    additionalDocs: [],
    availability: {},
    salaryRange: [1200, 1500],
    finalMessage: '',
};

// --- MODAL SUB-COMPONENTS ---

const ModalWrapper: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }> = ({ title, subtitle, onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
                    <Icon type="x" className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

const RequirementCheckStep: React.FC<{ user: ProfessionalUser; job: MockJob; onProceed: () => void; onNavigate: (view: View, id?: number) => void }> = ({ user, job, onProceed, onNavigate }) => {
    // ... (logic from previous implementation)
    return <div>...</div>; // For brevity, assuming this component exists and is unchanged
};


const ApplicationTypeStep: React.FC<{ onSelect: (type: 'rapid' | CustomApplicationSteps) => void }> = ({ onSelect }) => (
    <div className="space-y-4">
        <div className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-slate-50" onClick={() => onSelect('rapid')}>
            <h3 className="font-bold text-lg text-slate-800">⚡ Candidatura Rapida</h3>
            <p className="text-slate-600">Usa il tuo profilo AquaNetwork e il CV esistente. Rapido e semplice.</p>
            <p className="text-sm text-slate-500 mt-2">Tempo stimato: 30 secondi</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-slate-50" onClick={() => onSelect('custom_analysis')}>
            <h3 className="font-bold text-lg text-slate-800">✍️ Candidatura Personalizzata</h3>
            <p className="text-slate-600">Aggiungi una lettera di presentazione, documenti e personalizza la tua candidatura.</p>
             <p className="text-sm text-slate-500 mt-2">Tempo stimato: 3-5 minuti</p>
        </div>
    </div>
);

const RapidApplicationStep: React.FC<{ user: ProfessionalUser; onSubmit: () => void; onBack: () => void; }> = ({ user, onSubmit, onBack }) => (
     <div>
        <div className="mb-4">
            <h4 className="font-semibold text-slate-800 mb-2">Dati inviati:</h4>
            <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                <li>Profilo completo AquaNetwork</li>
                <li>CV generato automaticamente</li>
                <li>Certificazioni verificate</li>
            </ul>
        </div>
         <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email di contatto</label>
            <input type="email" value={user.email} readOnly className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 text-slate-500" />
        </div>
         <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Numero di telefono</label>
            <input type="tel" value={user.phone} readOnly className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 text-slate-500" />
        </div>
         <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Messaggio rapido (opzionale)</label>
            <textarea placeholder="Scrivi un breve messaggio..." rows={3} className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="flex justify-between items-center">
             <button onClick={onBack} className="font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100">&larr; Indietro</button>
            <button onClick={onSubmit} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">🚀 Invia</button>
        </div>
    </div>
);

const ConfirmationStep: React.FC<{ job: MockJob; onClose: () => void; onNavigate: (view: View) => void }> = ({ job, onClose, onNavigate }) => (
    <div className="text-center">
        <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <Icon type="check-double" className="w-8 h-8 text-green-600"/>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Candidatura Inviata!</h3>
        <p className="text-slate-600 mt-2">La tua candidatura per <strong>{job.title}</strong> presso <strong>{job.facilityName}</strong> è stata inviata con successo.</p>
        <p className="text-sm text-slate-500 mt-1">Riceverai una conferma via email a breve.</p>
        <div className="mt-6 border-t pt-4 space-y-2">
            <button onClick={() => { onNavigate('myApplications'); onClose(); }} className="w-full text-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">Vedi le mie candidature</button>
            <button onClick={onClose} className="w-full text-center font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100 transition">Chiudi</button>
        </div>
    </div>
);

// --- NEW CUSTOM APPLICATION STEPS ---

const CompatibilityAnalysisStep: React.FC<{ user: ProfessionalUser, job: MockJob, onProceed: () => void, onBack: () => void }> = ({ user, job, onProceed, onBack }) => {
    const { met, missing, score } = useMemo(() => {
        const met: string[] = [];
        const missing: string[] = [];
        const userCerts = user.certifications.map(c => c.name.toLowerCase());
        
        job.requirements.forEach(req => {
            const reqLower = req.toLowerCase();
            let isMet = userCerts.some(cert => reqLower.includes(cert));
            if (reqLower.includes('esperienza minima') && user.experience.length > 0) isMet = true;

            if (isMet) met.push(req); else missing.push(req);
        });
        const score = Math.round((met.length / job.requirements.length) * 100);
        return { met, missing, score };
    }, [user, job]);

    return (
        <div>
            <h3 className="font-semibold text-lg text-slate-800 mb-2">Analisi Compatibilità</h3>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-1">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${score}%` }}></div>
            </div>
            <p className="text-right text-sm font-bold text-slate-600 mb-4">{score}% compatibile</p>
            
            <div className="mb-4">
                <h4 className="font-bold text-green-700 mb-2">✅ Punti di Forza</h4>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {met.map((m, i) => <li key={i}>{m}</li>)}
                    <li>Zona Milano</li>
                </ul>
            </div>
             <div className="mb-4">
                <h4 className="font-bold text-amber-700 mb-2">⚠️ Aree di Miglioramento</h4>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {missing.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm mb-6">
                <p className="font-bold">💡 Consiglio per la candidatura:</p>
                <p>Evidenzia la tua esperienza con adolescenti e menziona la tua flessibilità oraria nella lettera motivazionale.</p>
            </div>
             <div className="flex justify-between items-center">
                <button onClick={onBack} className="font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100">&larr; Indietro</button>
                <button onClick={onProceed} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">🚀 Procedi</button>
            </div>
        </div>
    );
};

const CoverLetterStep: React.FC<{data: any, setData: Function, onNext: () => void, onBack: () => void}> = ({ data, setData, onNext, onBack}) => {
    return (
        <div>
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Perché questa posizione ti interessa?</label>
                <textarea 
                    value={data.coverLetter_interest}
                    onChange={(e) => setData({...data, coverLetter_interest: e.target.value})}
                    placeholder="Racconta in 2-3 frasi perché vuoi lavorare proprio in questa struttura..." 
                    rows={3} 
                    maxLength={500}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-right text-slate-400">{data.coverLetter_interest.length}/500</p>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">La tua specializzazione</label>
                <textarea 
                    value={data.coverLetter_specialization}
                    onChange={(e) => setData({...data, coverLetter_specialization: e.target.value})}
                    placeholder="Descrivi la tua esperienza specifica per questo ruolo di istruttore..." 
                    rows={4} 
                    maxLength={600}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-right text-slate-400">{data.coverLetter_specialization.length}/600</p>
            </div>
             <div className="flex justify-between items-center">
                <button onClick={onBack} className="font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100">&larr; Indietro</button>
                <button onClick={onNext} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">Continua &rarr;</button>
            </div>
        </div>
    )
};

const PreviewStep: React.FC<{job:MockJob, onSubmit: () => void, onBack: () => void}> = ({ job, onSubmit, onBack }) => {
    return (
        <div>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                 <p><strong>Posizione:</strong> {job.title}</p>
                 <p><strong>Struttura:</strong> {job.facilityName}</p>
            </div>
             <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">Documenti Allegati:</h4>
                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                    <li>Lettera motivazionale personalizzata</li>
                    <li>CV personalizzato (CV_Mario_Rossi_2025.pdf)</li>
                    <li>Certificazioni (3 documenti)</li>
                    <li>Portfolio (2 foto, 1 video)</li>
                </ul>
            </div>
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <p className="font-bold">Ultimo Controllo</p>
                <label className="flex items-center mt-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2">Confermo di aver controllato tutti i dati inseriti.</span>
                </label>
            </div>
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100">&larr; Modifica</button>
                <button onClick={onSubmit} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">📤 INVIA CANDIDATURA</button>
            </div>
        </div>
    )
};


export const ApplicationFlowModal: React.FC<ApplicationFlowModalProps> = ({ user, job, flowState, setFlowState, onSubmit, onNavigate }) => {
    
    const [customApplicationData, setCustomApplicationData] = useState(initialCustomData);
    
    const closeModal = () => {
        setFlowState({ step: 'idle', job: null });
        setCustomApplicationData(initialCustomData);
    };

    const titles: { [key in ApplicationFlowState['step']]: string | string[] } = {
        idle: '',
        requirements: `Candidatura per ${job.title}`,
        type: 'Come vuoi candidarti?',
        rapid: 'Candidatura Rapida',
        custom_analysis: `Candidatura per ${job.title}`,
        custom_letter: ['Lettera Motivazionale', 'Step 1 di 4'],
        custom_docs: ['Documentazione', 'Step 2 di 4'],
        custom_availability: ['Disponibilità', 'Step 3 di 4'],
        custom_final: ['Messaggio Finale', 'Step 4 di 4'],
        custom_preview: 'Anteprima Candidatura',
        confirmation: 'Fatto!',
    };
    
    const getTitle = () => {
        const titleInfo = titles[flowState.step];
        return Array.isArray(titleInfo) ? titleInfo[0] : titleInfo;
    };
    
    const getSubtitle = () => {
        const titleInfo = titles[flowState.step];
        return Array.isArray(titleInfo) ? titleInfo[1] : undefined;
    };


    const renderStep = () => {
        switch (flowState.step) {
            case 'requirements':
                // This step is now implicitly part of the custom flow's analysis
                return <CompatibilityAnalysisStep user={user} job={job} onProceed={() => setFlowState(prev => ({ ...prev, step: 'type' }))} onBack={closeModal} />;
            case 'type':
                return <ApplicationTypeStep onSelect={(type) => setFlowState(prev => ({ ...prev, step: type }))} />;
            case 'rapid':
                return <RapidApplicationStep user={user} onSubmit={() => onSubmit('rapida')} onBack={() => setFlowState(prev => ({...prev, step: 'type'}))}/>;
            case 'custom_analysis':
                 return <CompatibilityAnalysisStep 
                    user={user} 
                    job={job} 
                    onProceed={() => setFlowState(prev => ({ ...prev, step: 'custom_letter' }))}
                    onBack={() => setFlowState(prev => ({ ...prev, step: 'type' }))}
                 />;
            case 'custom_letter':
                return <CoverLetterStep 
                    data={customApplicationData} 
                    setData={setCustomApplicationData}
                    onNext={() => setFlowState(prev => ({...prev, step: 'custom_docs'}))}
                    onBack={() => setFlowState(prev => ({...prev, step: 'custom_analysis'}))}
                />;
             case 'custom_docs':
             case 'custom_availability':
             case 'custom_final':
                return (
                    <div className="text-center py-8">
                        <p className="text-slate-500">Questa sezione della candidatura personalizzata è in fase di sviluppo.</p>
                         <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setFlowState(prev => ({...prev, step: 'custom_letter'}))} className="font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100">&larr; Indietro</button>
                            <button onClick={() => setFlowState(prev => ({...prev, step: 'custom_preview'}))} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">Continua (salta) &rarr;</button>
                        </div>
                    </div>
                );
            case 'custom_preview':
                return <PreviewStep 
                    job={job}
                    onSubmit={() => onSubmit('personalizzata')}
                    onBack={() => setFlowState(prev => ({...prev, step: 'custom_final'}))}
                />
            case 'confirmation':
                return <ConfirmationStep job={job} onClose={closeModal} onNavigate={onNavigate} />;
            default:
                return null;
        }
    }

    return (
        <ModalWrapper title={getTitle()} subtitle={getSubtitle()} onClose={closeModal}>
           {renderStep()}
        </ModalWrapper>
    );
};
