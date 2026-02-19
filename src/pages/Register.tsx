// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../services/appwrite';
import { databaseService } from '../services/database';
import { USER_TYPES } from '../utils/constants';
import { useErrorHandler } from '../utils/errorHandler';
import { useAuth } from '../hooks/useAuth';
import { ID } from 'appwrite';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const { logRegistrationError } = useErrorHandler();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUserTypeSelection = (type: string) => {
    setUserType(type);
    setStep(2);
    console.log('📝 User type selected:', type);
  };

  const handleRegister = async (finalData: any) => {
    setLoading(true);
    try {
      console.log('🚀 Starting registration process...');

      // 1. Crea account
      const userId = ID.unique();
      const accountData = await account.create(
        userId,
        finalData.email,
        finalData.password,
        `${finalData.firstName || finalData.structureName || ''} ${finalData.lastName || ''}`
      );
      console.log('✅ Appwrite account created:', accountData.$id);

      // 2. ⚠️ IMPORTANTE: Autentica subito dopo la creazione
      await account.createEmailSession(finalData.email, finalData.password);
      console.log('✅ Session created successfully');

      // 3. ADESSO crea il profilo (con sessione attiva)
      console.log('📝 Creating profile in database...');

      if (userType === USER_TYPES.PROFESSIONAL) {
        await databaseService.createUserProfile(accountData.$id, {
          userId: accountData.$id,
          userType,
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          city: finalData.city,
          province: finalData.province,
          isActive: true
        });
      } else {
        await databaseService.createStructureProfile(accountData.$id, {
          userId: accountData.$id,
          userType,
          structureName: finalData.structureName,
          email: finalData.email,
          city: finalData.city,
          province: finalData.province,
          isActive: true
        });
      }

      console.log('✅ Profile created in database');

      // 4. Aggiorna lo stato dell'auth
      await login(finalData.email, finalData.password);
      console.log('🎉 Registration completed successfully!');

      alert('Registrazione completata con successo! 🎉');
      navigate('/');

    } catch (error) {
      console.error('❌ Registration error:', error);
      logRegistrationError(error as Error, userType);
      alert('Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', padding: 'var(--space-4)' }}>
      {step === 1 && <UserTypeSelection onSelect={handleUserTypeSelection} />}
      {step === 2 && userType === USER_TYPES.PROFESSIONAL && (
        <ProfessionalRegistration onSubmit={handleRegister} loading={loading} />
      )}
      {step === 2 && userType === USER_TYPES.STRUCTURE && (
        <StructureRegistration onSubmit={handleRegister} loading={loading} />
      )}
    </div>
  );
};

const UserTypeSelection: React.FC<{ onSelect: (type: string) => void }> = ({ onSelect }) => (
  <div className="text-center">
    <h2 className="card-title card-title-lg" style={{ color: 'var(--color-primary-700)', marginBottom: 'var(--space-2)' }}>
      🌊 Benvenuto su SwimWaveUp
    </h2>
    <p className="card-description">Scegli il tipo di account:</p>
    
    <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', flexDirection: 'row' }}>
      <div
        className="card card-interactive card-comfortable"
        onClick={() => onSelect(USER_TYPES.PROFESSIONAL)}
        style={{
          flex: 1,
          textAlign: 'center',
          border: '2px solid var(--color-primary-200)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
        }}
      >
        <h3 className="card-title">🏊‍♂️ Professionista</h3>
        <p className="card-description">Istruttore, Bagnino, Allenatore</p>
      </div>
      
      <div
        className="card card-interactive card-comfortable"
        onClick={() => onSelect(USER_TYPES.STRUCTURE)}
        style={{
          flex: 1,
          textAlign: 'center',
          border: '2px solid var(--color-primary-200)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
        }}
      >
        <h3 className="card-title">🏢 Centro Sportivo</h3>
        <p className="card-description">Piscina, Impianto, Struttura</p>
      </div>
    </div>
  </div>
);

// Form Registrazione Professionista
const ProfessionalRegistration: React.FC<{ onSubmit: (data: any) => void, loading: boolean }> = ({ onSubmit, loading }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    city: '',
    province: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Professional form data:', data);
    onSubmit(data);
  };

  return (
    <div>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        ← Torna indietro
      </button>

      <div className="card card-comfortable">
        <h3 className="card-title text-center" style={{ marginBottom: 'var(--space-4)' }}>
          🏊‍♂️ Registrazione Professionista
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <input
              name="firstName"
              placeholder="Nome *"
              value={data.firstName}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="lastName"
              placeholder="Cognome *"
              value={data.lastName}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={data.email}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="Password *"
              value={data.password}
              onChange={handleChange}
              required
              minLength={8}
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="city"
              placeholder="Città *"
              value={data.city}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>

          <div className="form-group">
            <select
              name="province"
              value={data.province}
              onChange={handleChange}
              required
              className="select"
            >
              <option value="">Seleziona Provincia *</option>
              <option value="MI">Milano</option>
              <option value="RM">Roma</option>
              <option value="NA">Napoli</option>
              <option value="TO">Torino</option>
              <option value="PA">Palermo</option>
              <option value="GE">Genova</option>
              <option value="BO">Bologna</option>
              <option value="FI">Firenze</option>
              <option value="BA">Bari</option>
              <option value="CT">Catania</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
          >
            Crea Account
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
            Hai già un account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-ghost"
              style={{ padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
            >
              Accedi
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

// Form Registrazione Struttura  
const StructureRegistration: React.FC<{ onSubmit: (data: any) => void, loading: boolean }> = ({ onSubmit, loading }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    structureName: '',
    email: '',
    password: '',
    city: '',
    province: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Structure form data:', data);
    onSubmit(data);
  };

  return (
    <div>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        ← Torna indietro
      </button>

      <div className="card card-comfortable">
        <h3 className="card-title text-center" style={{ marginBottom: 'var(--space-4)' }}>
          🏢 Registrazione Centro Sportivo
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <input
              name="structureName"
              placeholder="Nome Struttura *"
              value={data.structureName}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={data.email}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="Password *"
              value={data.password}
              onChange={handleChange}
              required
              minLength={8}
              className="input input-md"
            />
          </div>
          
          <div className="form-group">
            <input
              name="city"
              placeholder="Città *"
              value={data.city}
              onChange={handleChange}
              required
              className="input input-md"
            />
          </div>

          <div className="form-group">
            <select
              name="province"
              value={data.province}
              onChange={handleChange}
              required
              className="select"
            >
              <option value="">Seleziona Provincia *</option>
              <option value="MI">Milano</option>
              <option value="RM">Roma</option>
              <option value="NA">Napoli</option>
              <option value="TO">Torino</option>
              <option value="PA">Palermo</option>
              <option value="GE">Genova</option>
              <option value="BO">Bologna</option>
              <option value="FI">Firenze</option>
              <option value="BA">Bari</option>
              <option value="CT">Catania</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
          >
            Crea Account
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
            Hai già un account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-ghost"
              style={{ padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
            >
              Accedi
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;