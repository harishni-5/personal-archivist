import React from 'react';


const genres = ['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Biography', 'History', 'Self-Help', 'Other'];
const statuses = ['All', 'available', 'lent', 'reading', 'sold'];

const FilterBar = ({ filters, setFilters }) => {
  const inputStyle = {
    background: '#0f1825',
    border: '1px solid #1e2d44',
    borderRadius: '8px',
    color: '#e2e8f0',
    padding: '9px 14px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{
      background: 'rgba(13,19,32,0.8)',
      border: '1px solid #1e2d44',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '24px',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
        gap: '16px',
        alignItems: 'end',
      }}>

        {/* Search */}
        <div>
          <span style={labelStyle}>🔍 Search</span>
          <input
            type="text"
            placeholder="Title, author, or ISBN..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ ...inputStyle, paddingLeft: '14px' }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#1e2d44'}
          />
        </div>

        {/* Genre */}
        <div>
          <span style={labelStyle}>📂 Genre</span>
          <select
            value={filters.genre}
            onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
            style={inputStyle}
          >
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <span style={labelStyle}>📌 Status</span>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            style={inputStyle}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Year */}
        <div>
          <span style={labelStyle}>📅 Year After</span>
          <input
            type="number"
            placeholder="e.g. 1950"
            value={filters.yearFrom}
            onChange={e => setFilters(f => ({ ...f, yearFrom: e.target.value }))}
            style={inputStyle}
            min="1000" max="2030"
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#1e2d44'}
          />
        </div>

        {/* Clear */}
        <button
          onClick={() => setFilters({ search: '', genre: 'All', status: 'All', yearFrom: '' })}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            borderRadius: '8px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
