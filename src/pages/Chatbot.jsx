import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AGENTS, routeQuestion, buildContext } from '../agents/domainAgents';
import './Chatbot.css';

const MAX_HISTORY = 6; // Send last 6 messages (3 turns) to API

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your enterprise data assistant. I can answer questions across multiple domains:\n\n💰 **Sales** - Orders, customers, products, revenue\n👥 **HR** - Employees, departments, salaries, benefits\n💵 **Finance** - Transactions, budgets, invoices, tax\n📦 **Inventory** - Warehouses, stock, suppliers, transfers\n🔍 **Audit** - Access logs, compliance, security\n📊 **Schema** - Database tables, columns, metadata\n\nJust ask your question and I\'ll route it to the right agent!',
      domain: null,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('anthropic_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  // Get conversation history for a domain (last N messages)
  const getDomainHistory = (domain) => {
    const domainMessages = messages.filter(m =>
      m.domain === domain || (m.domain && Array.isArray(m.domains) && m.domains.includes(domain))
    );
    return domainMessages.slice(-MAX_HISTORY).map(m => ({
      role: m.role,
      content: m.content,
    }));
  };

  const sendToAgent = async (question, domains) => {
    if (!apiKey) {
      return "Please configure your Anthropic API key first by clicking the settings button.";
    }

    try {
      const context = buildContext(domains, question);
      const domainType = domains.length > 1 ? 'cross' : domains[0];

      // Get conversation history for continuity
      const history = getDomainHistory(domainType);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          apiKey,
          schemaContext: context,
          domain: domainType,
          history: history.slice(0, MAX_HISTORY),
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling backend:', error);
      if (error.message.includes('authentication') || error.message.includes('API key'))
        return "Authentication failed. Please check your API key in settings.";
      if (error.message.includes('Failed to fetch'))
        return "Cannot connect to backend server. Make sure the server is running on port 3001.";
      return `Error: ${error.message}. Please try again.`;
    }
  };

  const processQuestion = async (question, domains) => {
    setIsLoading(true);
    setActiveDomain(domains.length > 1 ? 'cross' : domains[0]);

    const response = await sendToAgent(question, domains);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      domain: domains.length > 1 ? 'cross' : domains[0],
      domains,
    }]);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');

    // Route the question
    const route = routeQuestion(userQuestion);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userQuestion,
      domain: route.domains.length > 0 ? route.domains[0] : null,
    }]);

    if (route.type === 'uncertain') {
      // Show domain picker
      setPendingQuestion(userQuestion);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'I\'m not sure which domain this question belongs to. Please select one:',
        domain: null,
      }]);
      return;
    }

    await processQuestion(userQuestion, route.domains);
  };

  const handleDomainSelect = async (domainId) => {
    if (!pendingQuestion) return;

    const question = pendingQuestion;
    setPendingQuestion(null);

    // Remove the system "pick domain" message
    setMessages(prev => prev.filter(m => m.role !== 'system'));

    // Update the user message domain
    setMessages(prev => {
      const updated = [...prev];
      const lastUserIdx = updated.findLastIndex(m => m.role === 'user');
      if (lastUserIdx >= 0) updated[lastUserIdx].domain = domainId;
      return updated;
    });

    await processQuestion(question, [domainId]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getDomainBadge = (message) => {
    if (!message.domain || message.role === 'user') return null;

    if (message.domain === 'cross' && message.domains) {
      return (
        <div className="domain-badge cross">
          {message.domains.map(d => (
            <span key={d} className="cross-tag" style={{ background: AGENTS[d]?.color }}>
              {AGENTS[d]?.icon}
            </span>
          ))}
          <span className="badge-text">Cross-Domain</span>
        </div>
      );
    }

    const agent = AGENTS[message.domain];
    if (!agent) return null;

    return (
      <div className="domain-badge" style={{ background: agent.color + '20', color: agent.color, borderColor: agent.color }}>
        {agent.icon} {agent.name}
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <header className="chat-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>🤖 Enterprise Data Assistant</h1>
          <p className="subtitle">Multi-agent system across Sales, HR, Finance, Inventory, Audit & Schema</p>
        </div>
        <div className="header-right">
          {activeDomain && activeDomain !== 'cross' && AGENTS[activeDomain] && (
            <div className="active-domain" style={{ background: AGENTS[activeDomain].color }}>
              {AGENTS[activeDomain].icon} {AGENTS[activeDomain].name}
            </div>
          )}
          <button
            className="settings-btn"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            title="Configure API Key"
          >
            ⚙️
          </button>
        </div>
      </header>

      {showApiKeyInput && (
        <div className="api-key-section">
          <div className="api-key-container">
            <h3>Configure Anthropic API Key</h3>
            <p className="api-help">
              Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>
            </p>
            <div className="api-key-input-group">
              <input
                type="password"
                className="api-key-input"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button className="save-key-btn" onClick={saveApiKey}>Save Key</button>
            </div>
            <p className="api-note">
              🔒 Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => {
          if (message.role === 'system') return null; // Don't render system messages as bubbles
          return (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' :
                  (message.domain && AGENTS[message.domain] ? AGENTS[message.domain].icon : '🤖')}
              </div>
              <div className="message-content">
                {getDomainBadge(message)}
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          );
        })}

        {/* Domain Picker - shown when router is uncertain */}
        {pendingQuestion && (
          <div className="domain-picker">
            <p className="picker-label">Which domain is this question about?</p>
            <div className="picker-buttons">
              {Object.values(AGENTS).map(agent => (
                <button
                  key={agent.id}
                  className="picker-btn"
                  style={{ '--agent-color': agent.color }}
                  onClick={() => handleDomainSelect(agent.id)}
                >
                  <span className="picker-icon">{agent.icon}</span>
                  <span className="picker-name">{agent.name}</span>
                  <span className="picker-desc">{agent.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              {activeDomain && AGENTS[activeDomain] ? AGENTS[activeDomain].icon : '🤖'}
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Ask about sales, HR, finance, inventory, audit, or database schema..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows="1"
            disabled={isLoading || !!pendingQuestion}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !!pendingQuestion}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
