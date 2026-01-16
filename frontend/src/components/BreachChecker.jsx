import { useState } from 'react';
import { breachAPI } from '../services/api';
import './BreachChecker.css';

function BreachChecker({ user }) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await breachAPI.check(email);
      setResult(response.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to check breach';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await breachAPI.getHistory();
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await breachAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="checker-container">
      <header className="checker-header">
        <h1>🔐 CredWatch</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="checker-content">
        <div className="check-section">
          <h2>Check Email Exposure</h2>
          <p>Enter an email address to check if it appears in known data breaches.</p>
          <form onSubmit={handleCheck}>
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                disabled={loading}
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className={`result-card ${result.exposed ? 'exposed' : 'safe'}`}>
              {result.exposed ? (
                <>
                  <h3>⚠️ Email Found in Breaches</h3>
                  <p>This email appears in {result.breach_count} known data breach{result.breach_count > 1 ? 'es' : ''}:</p>
                  <ul className="breach-list">
                    {result.breaches.map((breach, index) => (
                      <li key={index}>
                        <strong>{breach.name}</strong>
                        {breach.breach_date && <span> - {new Date(breach.breach_date).toLocaleDateString()}</span>}
                        {breach.description && <p>{breach.description}</p>}
                        {breach.data_classes && (
                          <div className="data-classes">
                            Compromised: {breach.data_classes.join(', ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                      <li>Change your password immediately</li>
                      <li>Enable two-factor authentication</li>
                      <li>Monitor your accounts for suspicious activity</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h3>✅ Good News!</h3>
                  <p>This email was not found in any known breaches in our database.</p>
                  <small>Checked at: {new Date(result.checked_at).toLocaleString()}</small>
                </>
              )}
            </div>
          )}
        </div>

        <div className="side-panel">
          <div className="stats-section">
            <h3>Database Statistics</h3>
            <button onClick={loadStats} className="btn-secondary">
              {stats ? 'Refresh' : 'Load Stats'}
            </button>
            {stats && (
              <div className="stats">
                <div className="stat-item">
                  <div className="stat-value">{stats.total_breaches}</div>
                  <div className="stat-label">Total Breaches</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.total_records.toLocaleString()}</div>
                  <div className="stat-label">Breach Records</div>
                </div>
              </div>
            )}
          </div>

          <div className="history-section">
            <h3>Your Check History</h3>
            <button onClick={loadHistory} className="btn-secondary">
              {history.length > 0 ? 'Refresh' : 'Load History'}
            </button>
            {history.length > 0 && (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id}>
                    <div>Hash: {item.email_hash}</div>
                    <div>Breaches: {item.breaches_found}</div>
                    <small>{new Date(item.checked_at).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="checker-footer">
        <p>
          <strong>Privacy Notice:</strong> We hash your email before checking and never store plaintext email addresses.
        </p>
      </footer>
    </div>
  );
}

export default BreachChecker;
