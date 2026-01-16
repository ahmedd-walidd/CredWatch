import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import BreachChecker from './components/BreachChecker';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <BreachChecker user={user} />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
