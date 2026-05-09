import React, { useState } from 'react';

const AddBook = ({ setCurrentPage, addBook, existingISBNs = [] }) => {
  const [form, setForm] = useState({
    title: '', isbn: '', author: '', year: '', genre: '', publisher: '', pageCount: '', status: 'available',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lookupMsg, setLookupMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchFromOpenLibrary = async () => {
    if (!form.isbn) {
      setLookupMsg('Enter an ISBN first');
      return;
    }
    setLoading(true);
    setLookupMsg('Looking up...');
    try {
      const cleanISBN = form.isbn.replace(/-/g, '');
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
      const data = await res.json();
      const key = `ISBN:${cleanISBN}`;
      if (data[key]) {
        const book = data[key];
        setForm(f => ({
          ...f,
          title: book.title || f.title,
          author: book.authors?.[0]?.name || f.author,
          year: book.publish_date?.slice(-4) || f.year,
          publisher: book.publishers?.[0]?.name || f.publisher,
          pageCount: book.number_of_pages || f.pageCount,
        }));
        setLookupMsg('✅ Auto-filled from OpenLibrary!');
      } else {
        setLookupMsg('⚠️ Book not found in OpenLibrary. Fill manually.');
      }
    } catch {
      setLookupMsg('Lookup failed. Fill manually.');
    }
    setLoading(false);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    else if (!/^[\d-]{10,17}$/.test(form.isbn.replace(/\s/g, ''))) e.isbn = 'Invalid ISBN format';
    else if (existingISBNs.includes(form.isbn.replace(/-/g, ''))) e.isbn = 'This book is already in your collection';
    if (!form.author.trim()) e.author = 'Author is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await addBook({
        title: form.title,
        isbn: form.isbn.replace(/-/g, ''),
        author: form.author,
        year: form.year ? parseInt(form.year) : null,
        genre: form.genre,
        publisher: form.publisher,
        pageCount: form.pageCount ? parseInt(form.pageCount) : null,
        status: form.status,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ title: '', isbn: '', author: '', year: '', genre: '', publisher: '', pageCount: '', status: 'available' });
        setCurrentPage('dashboard');
      }, 1500);
    } catch (err) {
      setErrors({ submit: 'Failed to save book. Check your connection and try again.' });
    }
    setSubmitting(false);
  };

  const inputStyle = (err) => ({
    background: '#0f1825',
    border: `1px solid ${err ? '#ef4444' : '#1e2d44'}`,
    borderRadius: '10px',
    color: '#e2e8f0',
    padding: '11px 14px',
    fontSize: '14px',
    width: '100%',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    display: 'block',
  };

  const Field = ({ name, label, placeholder, type = 'text', half }) => (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={inputStyle(errors[name])}
        onFocus={e => !errors[name] && (e.target.style.borderColor = '#3b82f6')}
        onBlur={e => !errors[name] && (e.target.style.borderColor = '#1e2d44')}
      />
      {errors[name] && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>⚠ {errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '680px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentPage('dashboard')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          fontSize: '14px',
          marginBottom: '24px',
          padding: 0,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        ← Back to Library
      </button>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          New Entry
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #e2e8f0, #64748b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Add a Book
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
          Enter an ISBN and auto-fetch details from OpenLibrary, or fill manually.
        </p>
      </div>

      <div style={{
        background: '#0d1320',
        border: '1px solid #1e2d44',
        borderRadius: '20px',
        padding: '28px',
      }}>

        {/* ISBN + Lookup */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>ISBN (Auto-fill)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g. 978-0451524935"
              value={form.isbn}
              onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
              style={{ ...inputStyle(errors.isbn), flex: 1 }}
            />
            <button
              onClick={fetchFromOpenLibrary}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                color: '#fff',
                borderRadius: '10px',
                padding: '11px 20px',
                fontWeight: 600,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? '...' : '🔍 Lookup'}
            </button>
          </div>
          {errors.isbn && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>⚠ {errors.isbn}</div>}
          {lookupMsg && <div style={{ marginTop: '8px', fontSize: '13px', color: '#94a3b8' }}>{lookupMsg}</div>}
        </div>

        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field name="title" label="📕 Title" placeholder="Book title" />
          <Field name="author" label="✍️ Author" placeholder="Author name" />
          <Field name="year" label="📅 Year" placeholder="e.g. 1984" type="number" half />
          <div>
            <label style={labelStyle}>📂 Genre</label>
            <select
              value={form.genre}
              onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
              style={inputStyle(false)}
            >
              {['', 'Fiction', 'Dystopian', 'Classic', 'Romance', 'Fantasy', 'Sci-Fi', 'Historical', 'Other'].map(g => (
                <option key={g} value={g}>{g || '-- Select Genre --'}</option>
              ))}
            </select>
          </div>
          <Field name="publisher" label="Publisher" placeholder="Publisher name" />
          <Field name="pageCount" label="📄 Page Count" placeholder="e.g. 328" type="number" half />
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>📌 Status</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['available', 'lent', 'sold'].map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  style={{
                    flex: 1,
                    background: form.status === s ? 'rgba(59,130,246,0.2)' : '#0f1825',
                    border: `1px solid ${form.status === s ? '#3b82f6' : '#1e2d44'}`,
                    color: form.status === s ? '#3b82f6' : '#64748b',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
            ⚠ {errors.submit}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          style={{
            marginTop: '24px',
            width: '100%',
            background: submitted
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: '#fff',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: 700,
            fontSize: '16px',
            transition: 'all 0.3s',
            cursor: submitting || submitted ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitted ? '✅ Book Added! Redirecting...' : submitting ? 'Saving...' : '+ Add to Collection'}
        </button>
      </div>
    </div>
  );
};

export default AddBook;
