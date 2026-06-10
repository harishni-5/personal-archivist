import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddBook from './pages/AddBook';
import AuthPage from './pages/AuthPage';
import './index.css';

const API = 'https://personal-archivist-production.up.railway.app';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { token, username, id }

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ token, username });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch books whenever user logs in
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API}/api/books`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => {
        if (r.status === 401) { handleLogout(); return []; }
        return r.json();
      })
      .then(data => { setBooks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.token}`,
  });

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setBooks([]);
  };

  const addBook = async (newBook) => {
    const res = await fetch(`${API}/api/books`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        title: newBook.title, isbn: newBook.isbn,
        year: newBook.year, genre: newBook.genre,
        publisher: newBook.publisher, pages: newBook.pageCount,
        status: 'available',
      }),
    });
    const saved = await res.json();
    setBooks(prev => [...prev, saved]);
  };

  const removeBook = async (isbn) => {
    await fetch(`${API}/api/books/${isbn}`, { method: 'DELETE', headers: authHeaders() });
    setBooks(prev => prev.filter(b => b.isbn !== isbn));
  };

  const updateBook = async (updatedBook) => {
    const res = await fetch(`${API}/api/books/${updatedBook.isbn}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({
        title: updatedBook.title, year: updatedBook.year,
        genre: updatedBook.genre, publisher: updatedBook.publisher,
        pages: updatedBook.pages, status: updatedBook.status,
        favourite: updatedBook.favourite, rating: updatedBook.rating,
      }),
    });
    const saved = await res.json();
    setBooks(prev => prev.map(b => b.isbn === saved.isbn ? saved : b));
  };

  // Not logged in → show auth page
  if (!user) return <AuthPage onLogin={handleLogin} />;

  if (loading) return (
    <div style={{ padding: '2rem', fontSize: '1.2rem', color: '#e2e8f0', background: '#070c15', minHeight: '100vh' }}>
      Loading your library...
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard books={books} updateBook={updateBook} removeBook={removeBook} />;
      case 'add': return <AddBook setCurrentPage={setCurrentPage} addBook={addBook} existingISBNs={books.map(b => b.isbn)} />;
      default: return <Dashboard books={books} updateBook={updateBook} removeBook={removeBook} />;
    }
  };

  return (
    <div>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalBooks={books.length}
        username={user.username}
        onLogout={handleLogout}
      />
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;