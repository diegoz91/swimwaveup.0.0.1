import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useErrorHandler } from '../utils/errorHandler';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasRedirected, setHasRedirected] = useState(false);
    
    const { login, authenticated, isLoading: authLoading } = useAuth();
    const { logAppwriteError } = useErrorHandler();
    const navigate = useNavigate();

    // Reindirizza alla home se l'utente è già autenticato
    useEffect(() => {
        if (authenticated && !authLoading && !hasRedirected) {
            console.log('User is authenticated, redirecting to home...');
            setHasRedirected(true);
            navigate('/', { replace: true });
        }
    }, [authenticated, authLoading, navigate, hasRedirected]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Previeni submit multipli
        if (loading || authLoading) return;
        
        setLoading(true);
        
        try {
            console.log('Tentativo di login...');
            await login(email, password);
            console.log('Login successful, waiting for state update...');
            // Il reindirizzamento avverrà tramite useEffect quando authenticated diventa true
        } catch (error: any) {
            console.error('Login failed:', error);
            logAppwriteError(error, 'login-page');
            
            // Gestisci diversi tipi di errore
            if (error.message?.includes('rate limit') || error.message?.includes('429') || error.message?.includes('Troppi tentativi')) {
                alert('Troppi tentativi di accesso. Attendi qualche minuto prima di riprovare.');
            } else if (error.message?.includes('Invalid credentials') || error.code === 401) {
                alert('Credenziali non valide. Controlla email e password.');
            } else {
                alert('Errore durante il login. Riprova più tardi.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Mostra loading se sta verificando l'autenticazione
    if (authLoading && !hasRedirected) {
        return (
            <div className="container" style={{ maxWidth: '400px', padding: 'var(--space-4)' }}>
                <div className="card card-comfortable text-center" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>
                        <div 
                            className="btn-loading" 
                            style={{ 
                                width: '48px', 
                                height: '48px', 
                                border: '3px solid var(--color-primary-200)', 
                                borderRadius: '50%',
                                margin: '0 auto var(--space-4) auto'
                            }}
                        ></div>
                        <p className="card-description">Verifica autenticazione...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '400px', padding: 'var(--space-4)' }}>
            <div className="card card-comfortable">
                <h3 className="card-title text-center" style={{ marginBottom: 'var(--space-6)' }}>
                    🌊 Login SwimWaveUp
                </h3>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            disabled={loading || authLoading}
                            className="input input-md"
                        />
                    </div>
                    
                    <div className="form-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            disabled={loading || authLoading}
                            className="input input-md"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || authLoading}
                        className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
                    >
                        {loading ? 'Accesso in corso...' : 'Login'}
                    </button>
                    
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                        Non hai un account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="btn btn-ghost"
                            style={{ padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
                        >
                            Registrati
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;