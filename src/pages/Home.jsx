import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

const projects = [
  {
    id: 'schema',
    icon: '📊',
    title: 'Schema Details',
    description: 'Browse table and column information from multiple Oracle schemas. View data types, relationships, and metadata.',
    status: 'active',
    link: '/data',
    linkText: 'Browse Data',
  },
  {
    id: 'assistant',
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Ask questions about your enterprise data in natural language. Multi-agent system across Sales, HR, Finance, Inventory, Audit & Schema.',
    status: 'active',
    link: '/chat',
    linkText: 'Ask AI Assistant',
  },
  {
    id: 'insights',
    icon: '💡',
    title: 'Insights',
    description: 'Advanced analytics dashboards, trend analysis, and AI-powered recommendations across your enterprise data.',
    status: 'coming-soon',
    link: null,
    linkText: 'Coming Soon',
  },
];

function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="home-container">
      <div className="home-topbar">
        <span className="user-email">{user?.email}</span>
        <button className="logout-btn" onClick={signOut}>Sign Out</button>
      </div>
      <div className="home-content">
        <h1>Welcome to Dhar's Pilot Project Explorer</h1>
        <p className="subtitle">
          Your unified hub for data exploration, AI-powered analytics, and insights
        </p>
        <h2 className="section-heading">Projects</h2>
        <div className="project-grid">
          {projects.map(project => (
            <div key={project.id} className={`project-card ${project.status === 'coming-soon' ? 'disabled' : ''}`}>
              <div className="project-card-header">
                <span className="project-icon">{project.icon}</span>
                <span className={`status-badge ${project.status}`}>
                  {project.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              {project.link ? (
                <Link to={project.link} className="project-link">
                  {project.linkText} →
                </Link>
              ) : (
                <span className="project-link-disabled">{project.linkText}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
