import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <footer style={{
        padding: '1rem',
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 1000
    }}>
      <a href="/">Home</a>
      <a href="/jobs">Jobs</a>
      <a href="/chat">Chat</a>
      <a href="/network">Network</a>
      <a href="/profile">Profile</a>
    </footer>
  );
};

export default BottomNav;
