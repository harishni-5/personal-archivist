import React from 'react';

const Navbar = ({ currentPage, setCurrentPage, totalBooks, username, onLogout }) => {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1e2d44', padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32, height: 32, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
        }}>📚</div>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px',
          background: 'linear-gradient(90deg,#e2e8f0,#94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Personal Archivist</span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[{ id: 'dashboard', label: '📖 Library' }, { id: 'add', label: '+ Add Book' }].map(item => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
            background: currentPage === item.id ? 'rgba(59,130,246,0.15)' : 'transparent',
            color: currentPage === item.id ? '#3b82f6' : '#94a3b8',
            border: currentPage === item.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            padding: '7px 16px', borderRadius: '8px', fontSize: '14px',
            fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer',
          }}>{item.label}</button>
        ))}
      </div>

      {/* Right side — book count + user + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '999px', padding: '5px 14px', fontSize: '13px', color: '#94a3b8',
        }}>
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>{totalBooks}</span> books
        </div>

        {username && (
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            👤 <span style={{ color: '#94a3b8' }}>{username}</span>
          </div>
        )}

        {onLogout && (
          <button onClick={onLogout} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', borderRadius: '8px', padding: '6px 14px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;