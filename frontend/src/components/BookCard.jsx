import React, { useState } from 'react';

const BookCard = ({ book, onClick, updateBook }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const statusLabel = {
    available: 'Available',
    lent: 'Lent',
    sold: 'Sold',
    reading: 'Reading',
  };

  const statusIcon = {
    available: '●',
    lent: '◐',
    sold: '✕',
    reading: '▶',
  };

  const handleFavourite = async (e) => {
    e.stopPropagation();
    await updateBook({ ...book, favourite: !book.favourite });
  };

  return (
    <div
      onClick={() => onClick(book)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#111e30' : '#0f1825',
        border: `1px solid ${hovered ? '#3b82f6' : '#1e2d44'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 30px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover */}
      <div style={{
        height: '180px',
        background: 'linear-gradient(135deg, #0d1320, #1a2540)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {!imgError && book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            onError={() => setImgError(true)}
            style={{ height: '100%', width: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📖</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>No cover</div>
          </div>
        )}

        {/* Status badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span className={`badge ${book.status}`}>
            {statusIcon[book.status] || '●'} {statusLabel[book.status] || book.status}
          </span>
        </div>

        {/* Favourite star */}
        {book.favourite && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '16px' }}>⭐</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flexGrow: 1 }}>
        <div style={{
          fontSize: '15px', fontWeight: 700, color: '#e2e8f0',
          marginBottom: '4px', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
          {book.author}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #1e2d44', paddingTop: '10px', marginTop: 'auto',
        }}>
          <span style={{
            fontSize: '11px', background: 'rgba(59,130,246,0.1)',
            color: '#60a5fa', padding: '3px 8px', borderRadius: '6px',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            {book.genre}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{book.year}</span>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid #1e2d44',
        display: 'flex', gap: '8px',
      }}>
        <button
          onClick={e => { e.stopPropagation(); onClick(book); }}
          style={{
            flex: 1, background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa',
            borderRadius: '8px', padding: '6px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >View</button>
        <button
          onClick={handleFavourite}
          style={{
            flex: 1,
            background: book.favourite ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${book.favourite ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.2)'}`,
            color: '#f59e0b', borderRadius: '8px', padding: '6px',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}
        >{book.favourite ? '★ Fav' : '☆ Fav'}</button>
      </div>
    </div>
  );
};

export default BookCard;
