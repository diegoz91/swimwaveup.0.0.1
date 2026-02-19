import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
  return (
    <header style={{
        padding: '1rem',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000
    }}>
      <div className="font-bold text-xl text-blue-600">AquaNetwork</div>
      <nav style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <a href="/">Home</a>
        <a href="/jobs">Jobs</a>
        <a href="/network">Network</a>
        {user && <button onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
};

export default Header;
