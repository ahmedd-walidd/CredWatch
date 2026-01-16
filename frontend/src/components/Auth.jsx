import { useState } from 'react';
import { authAPI } from '../services/api';
import './Auth.css';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            {!isLogin && (
              <small>Minimum 8 characters with uppercase, lowercase, and number</small>
            )}
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} disabled={loading}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
