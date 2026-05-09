import React, { useState, useMemo } from 'react';
import BookCard from '../components/BookCard';
import FilterBar from '../components/FilterBar';
import BookModal from '../components/BookModal';

const Dashboard = ({ books, updateBook, removeBook }) => {
  const [filters, setFilters] = useState({
    search: '',
    genre: 'All',
    status: 'All',
    yearFrom: '',
    favouritesOnly: false,
  });
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const search = filters.search.toLowerCase();
      const matchSearch =
        !search ||
        (book.title || '').toLowerCase().includes(search) ||
        (book.isbn || '').includes(search);
      const matchGenre = filters.genre === 'All' || book.genre === filters.genre;
      const matchStatus = filters.status === 'All' || book.status === filters.status;
      const matchYear = !filters.yearFrom || (book.year || 0) >= parseInt(filters.yearFrom);
      const matchFav = !filters.favouritesOnly || book.favourite;
      return matchSearch && matchGenre && matchStatus && matchYear && matchFav;
    });
  }, [books, filters]);

  const stats = {
    total: books.length,
    available: books.filter(b => b.status === 'available').length,
    lent: books.filter(b => b.status === 'lent').length,
    sold: books.filter(b => b.status === 'sold').length,
  };

  // When a book is updated via modal, update selectedBook too so modal reflects changes
  const handleUpdateBook = async (updatedBook) => {
    await updateBook(updatedBook);
    setSelectedBook(null);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>My Collection</div>
        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Personal Archivist</h1>
        <p>Your books, tracked and organized.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        <div>Total Books: {stats.total}</div>
        <div>Available: {stats.available}</div>
        <div>Lent: {stats.lent}</div>
        <div>Sold: {stats.sold}</div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      {filteredBooks.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {filteredBooks.map(book => (
            <BookCard
              key={book.isbn}
              book={book}
              onClick={setSelectedBook}
              removeBook={removeBook}
              updateBook={updateBook}
            />
          ))}
        </div>
      ) : (
        <div>No books found</div>
      )}

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          updateBook={handleUpdateBook}
          removeBook={removeBook}
        />
      )}
    </div>
  );
};

export default Dashboard;
