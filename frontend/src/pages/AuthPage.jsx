import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000';

const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
  
    const token = params.get('token');
    const username = params.get('username');
  
    if (token) {
      localStorage.setItem('token', token);
  
      if (username) {
        localStorage.setItem('username', username);
      }
  
      onLogin({
        token,
        username,
      });
  
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const url = mode === 'login' ? `${API}/api/auth/login` : `${API}/api/auth/register`;
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Something went wrong'); setLoading(false); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onLogin(data);
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  const inp = {
    background: '#0f1825', border: '1px solid #1e2d44', borderRadius: '10px',
    color: '#e2e8f0', padding: '11px 14px', fontSize: '14px', width: '100%',
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#070c15',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0d1320', border: '1px solid #1e2d44', borderRadius: '20px',
        padding: '40px', width: '100%', maxWidth: '420px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Personal Archivist</h1>
          <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>Your books, tracked and organized</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: '#0f1825', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: mode === m ? '#1e3a5f' : 'transparent',
                color: mode === m ? '#60a5fa' : '#64748b',
                fontWeight: 600, fontSize: '14px', transition: 'all .2s',
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>USERNAME</label>
              <input style={inp} placeholder="yourname" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          )}
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input style={inp} type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', padding: '10px', background: 'rgba(239,68,68,.1)', borderRadius: '8px' }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          marginTop: '20px', width: '100%', padding: '13px',
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          border: 'none', color: '#fff', borderRadius: '12px',
          fontWeight: 700, fontSize: '15px', cursor: loading ? 'default' : 'pointer',
          opacity: loading ? .7 : 1,
        }}>
          {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#1e2d44' }} />
          <span style={{ color: '#475569', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#1e2d44' }} />
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} style={{
          width: '100%', padding: '12px', border: '1px solid #1e2d44',
          background: '#0f1825', color: '#e2e8f0', borderRadius: '12px',
          fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPage;