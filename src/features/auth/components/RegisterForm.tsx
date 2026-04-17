import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

export const RegisterForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const { register, isLoading } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            showToast('La password deve contenere almeno 8 caratteri.', 'error');
            return;
        }

        try {
            await register(email, password, name, 'professional');
            showToast('Account creato con successo! Benvenuto in SwimIn 🌊', 'success');
            navigate('/profile'); 
        } catch (err: any) {
            if (err.code === 409 || (err.message && err.message.toLowerCase().includes('already exists'))) {
                showToast('Questa email è già registrata! Vai alla pagina di Login per accedere.', 'error');
            } else {
                showToast(err.message || 'Errore durante la registrazione. Controlla i dati e riprova.', 'error');
            }
        }
    };

    return (
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Unisciti a SwimIn</h1>
                <p className="text-slate-500 mt-2">Crea il tuo profilo e fai rete nel mondo del nuoto.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                        Nome e Cognome
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50 focus:bg-white"
                        placeholder="Es. Mario Rossi"
                        disabled={isLoading}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email Professionale</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50 focus:bg-white"
                        placeholder="nome@esempio.com"
                        disabled={isLoading}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50 focus:bg-white"
                        placeholder="Minimo 8 caratteri"
                        minLength={8}
                        disabled={isLoading}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 mt-2 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                            <span>Creazione in corso...</span>
                        </>
                    ) : (
                        'Crea Account'
                    )}
                </button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-6">
                Iscrivendoti accetti i nostri Termini di Servizio e la Privacy Policy.
            </p>

            <div className="mt-6 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-600">
                    Hai già un account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    );
};