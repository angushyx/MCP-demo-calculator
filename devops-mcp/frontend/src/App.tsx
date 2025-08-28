import React, { useState } from 'react';
import DevOpsPanel from './components/DevOpsPanel';
import NotionPanel from './components/NotionPanel';

function App() {
  const [activePanel, setActivePanel] = useState('devops');

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        width: 240, 
        background: '#1f2937', 
        padding: 20,
        color: '#fff'
      }}>
        <h1 style={{ fontSize: 18, marginBottom: 24 }}>Workspace Assistant</h1>
        <nav>
          <button
            onClick={() => setActivePanel('devops')}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: activePanel === 'devops' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'background 0.2s'
            }}
          >
            🔧 DevOps
          </button>
          <button
            onClick={() => setActivePanel('notion')}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: activePanel === 'notion' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'background 0.2s'
            }}
          >
            📝 Notion
          </button>
          <button
            onClick={() => setActivePanel('canva')}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: activePanel === 'canva' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'background 0.2s'
            }}
          >
            🎨 Canva
          </button>
          <button
            onClick={() => setActivePanel('slack')}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: activePanel === 'slack' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'background 0.2s'
            }}
          >
            💬 Slack
          </button>
        </nav>
        
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: 40,
          fontSize: 12,
          color: '#9ca3af'
        }}>
          <div>Status: Connected</div>
          <div>Mode: Mock Mode</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32, background: '#fff' }}>
        {activePanel === 'devops' && <DevOpsPanel />}
        {activePanel === 'notion' && <NotionPanel />}
        {activePanel === 'canva' && (
          <div>
            <h2>🎨 Canva Integration</h2>
            <p style={{ color: '#6b7280' }}>Coming soon...</p>
          </div>
        )}
        {activePanel === 'slack' && (
          <div>
            <h2>💬 Slack Integration</h2>
            <p style={{ color: '#6b7280' }}>
              Slack integration is available via API. Configure your Slack Bot Token in the backend environment variables.
            </p>
            <div style={{ marginTop: 20, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Available Slash Commands:</h3>
              <ul style={{ marginLeft: 20 }}>
                <li><code>/ai-summary [diff]</code> - Generate a summary of code changes</li>
                <li><code>/ai-docs [diff]</code> - Generate documentation patches</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
