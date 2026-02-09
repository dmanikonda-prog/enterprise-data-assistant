import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Database Schema Viewer</h1>
        <p className="subtitle">
          View and explore Oracle database schema information
        </p>
        <div className="features">
          <div className="feature-card">
            <h3>📊 Schema Details</h3>
            <p>Browse table and column information from multiple Oracle schemas</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Assistant</h3>
            <p>Ask questions about your database in natural language</p>
          </div>
          <div className="feature-card">
            <h3>💬 Comments & Insights</h3>
            <p>View Oracle comments, AI insights, and analyst notes</p>
          </div>
        </div>
        <div className="action-buttons">
          <Link to="/chat" className="chat-btn">
            🤖 Ask AI Assistant
          </Link>
          <Link to="/data" className="view-data-btn">
            📊 Browse Data
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
