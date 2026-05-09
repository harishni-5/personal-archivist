import React, { useState } from 'react';

const BookModal = ({ book, onClose, updateBook, removeBook }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: book?.title || '',
    year: book?.year || '',
    genre: book?.genre || '',
    publisher: book?.publisher || '',
    pages: book?.pages || '',
    status: book?.status || 'available',
    rating: book?.rating || '',
  });

  if (!book) return null;

  const handleSave = async () => {
    await updateBook({
      ...book,
      ...form,
      year: form.year ? parseInt(form.year) : book.year,
      pages: form.pages ? parseInt(form.pages) : book.pages,
      rating: form.rating ? parseInt(form.rating) : book.rating,
    });
    setEditing(false);
    onClose();
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove "${book.title}" from your library?`)) {
      await removeBook(book.isbn);
      onClose();
    }
  };

  const handleFavourite = async () => {
    await updateBook({ ...book, favourite: !book.favourite });
    onClose();
  };

  const inputStyle = {
    background: '#0f1825',
    border: '1px solid #1e2d44',
    borderRadius: '8px',
    color: '#e2e8f0',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
  };

  const statuses = ['available', 'reading', 'lent', 'sold'];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1320',
          border: '1px solid #1e2d44',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid #1e2d44',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Book Details
            </div>
            <h2 style={{ fontSize: '20px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 }}>
              {book.title}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Favourite button */}
            <button
              onClick={handleFavourite}
              title={book.favourite ? 'Remove from favourites' : 'Add to favourites'}
              style={{
                background: book.favourite ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.07)',
                border: `1px solid ${book.favourite ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.2)'}`,
                color: '#f59e0b',
                borderRadius: '8px',
                width: '32px', height: '32px',
                fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {book.favourite ? '★' : '☆'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                borderRadius: '8px',
                width: '32px', height: '32px',
                fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        {!editing ? (
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { label: 'ISBN', value: book.isbn, icon: '🔑' },
              { label: 'Year', value: book.year, icon: '📅' },
              { label: 'Genre', value: book.genre, icon: '📂' },
              { label: 'Publisher', value: book.publisher, icon: '🏢' },
              { label: 'Pages', value: book.pages, icon: '📄' },
              { label: 'Rating', value: book.rating ? `${book.rating}/10` : '—', icon: '⭐' },
              { label: 'Status', value: book.status, icon: '📌', isStatus: true },
              { label: 'Favourite', value: book.favourite ? 'Yes ★' : 'No', icon: '❤️' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#0f1825', border: '1px solid #1e2d44',
                borderRadius: '10px', padding: '12px 14px',
              }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                  {item.icon} {item.label}
                </div>
                {item.isStatus ? (
                  <span className={`badge ${book.status}`}>{book.status}</span>
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{item.value || '—'}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Edit form */
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { key: 'title', label: 'Title', span: true },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'pages', label: 'Pages', type: 'number' },
              { key: 'genre', label: 'Genre' },
              { key: 'publisher', label: 'Publisher' },
              { key: 'rating', label: 'Rating (1-10)', type: 'number' },
            ].map(f => (
              <div key={f.key} style={f.span ? { gridColumn: '1/-1' } : {}}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>{f.label}</div>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Status</div>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                style={inputStyle}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #1e2d44',
          display: 'flex', gap: '10px',
        }}>
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none', color: '#fff',
                  borderRadius: '10px', padding: '11px',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >✏️ Edit Book</button>
              <button
                onClick={handleRemove}
                style={{
                  flex: 1,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', borderRadius: '10px', padding: '11px',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >🗑️ Remove</button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  border: 'none', color: '#fff',
                  borderRadius: '10px', padding: '11px',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >✅ Save Changes</button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  background: 'rgba(100,116,139,0.1)',
                  border: '1px solid rgba(100,116,139,0.2)',
                  color: '#94a3b8', borderRadius: '10px', padding: '11px',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookModal;
