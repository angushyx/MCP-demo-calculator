import React, { useState, useEffect } from 'react';
import { notion } from '../services/notion';

interface NotionPage {
  id: string;
  title: string;
  status?: string;
  url: string;
}

interface DatabaseItem {
  id: string;
  properties: any;
}

export default function NotionPanel() {
  const [activeTab, setActiveTab] = useState<'search' | 'create' | 'database'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NotionPage[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageContent, setNewPageContent] = useState('');
  const [databaseId, setDatabaseId] = useState('mock-db-123');
  const [databaseItems, setDatabaseItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 搜索頁面
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    setMessage('');
    try {
      const data = await notion.searchPages(searchQuery);
      setSearchResults(data.results || []);
      setMessage(`Found ${data.results?.length || 0} pages`);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // 創建頁面
  const handleCreatePage = async () => {
    if (!newPageTitle || !newPageContent) {
      setMessage('Please fill in both title and content');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const result = await notion.createPage(newPageTitle, newPageContent);
      setMessage(result.message || 'Page created successfully!');
      setNewPageTitle('');
      setNewPageContent('');
    } catch (error) {
      console.error('Create error:', error);
      setMessage('Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  // 獲取資料庫項目
  const loadDatabaseItems = async () => {
    setLoading(true);
    try {
      const data = await notion.getDatabaseItems(databaseId);
      setDatabaseItems(data.items || []);
      setMessage(`Loaded ${data.items?.length || 0} items`);
    } catch (error) {
      console.error('Load database error:', error);
      setMessage('Failed to load database items');
    } finally {
      setLoading(false);
    }
  };

  // 創建資料庫項目
  const handleCreateDatabaseItem = async () => {
    const properties = {
      Name: { title: [{ text: { content: 'New Task from DevOps MCP' } }] },
      Status: { select: { name: 'Todo' } },
      Priority: { select: { name: 'Medium' } },
      DueDate: { date: { start: new Date().toISOString().split('T')[0] } }
    };
    
    setLoading(true);
    try {
      const result = await notion.createDatabaseItem(databaseId, properties);
      setMessage(result.message || 'Database item created!');
      await loadDatabaseItems();
    } catch (error) {
      console.error('Create database item error:', error);
      setMessage('Failed to create database item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Notion Integration
      </h2>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'search' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'search' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Search Pages
        </button>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'create' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'create' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Create Page
        </button>
        <button
          onClick={() => setActiveTab('database')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'database' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'database' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Database
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: 12,
          background: message.includes('failed') ? '#fee2e2' : '#dcfce7',
          color: message.includes('failed') ? '#991b1b' : '#166534',
          borderRadius: 6,
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for Notion pages..."
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 14
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery}
              style={{
                padding: '10px 20px',
                background: loading || !searchQuery ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading || !searchQuery ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
                Search Results
              </h3>
              {searchResults.map((page) => (
                <div
                  key={page.id}
                  style={{
                    padding: 12,
                    background: '#fff',
                    marginBottom: 8,
                    borderRadius: 6,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{page.title}</div>
                  {page.status && (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#e5e7eb',
                      borderRadius: 4,
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      {page.status}
                    </span>
                  )}
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    ID: {page.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Page Tab */}
      {activeTab === 'create' && (
        <div>
          <input
            type="text"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            placeholder="Page title..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 12
            }}
          />
          <textarea
            value={newPageContent}
            onChange={(e) => setNewPageContent(e.target.value)}
            placeholder="Page content (markdown supported)..."
            style={{
              width: '100%',
              minHeight: 200,
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
              fontFamily: 'ui-monospace, monospace',
              marginBottom: 12
            }}
          />
          <button
            onClick={handleCreatePage}
            disabled={loading || !newPageTitle || !newPageContent}
            style={{
              padding: '10px 20px',
              background: loading || !newPageTitle || !newPageContent ? '#9ca3af' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading || !newPageTitle || !newPageContent ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="Database ID..."
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 14
              }}
            />
            <button
              onClick={loadDatabaseItems}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Load Items'}
            </button>
            <button
              onClick={handleCreateDatabaseItem}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Add Item'}
            </button>
          </div>

          {/* Database Items */}
          {databaseItems.length > 0 && (
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
                Database Items
              </h3>
              {databaseItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 12,
                    background: '#fff',
                    marginBottom: 8,
                    borderRadius: 6,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <pre style={{
                    fontSize: 12,
                    overflow: 'auto',
                    maxHeight: 100
                  }}>
                    {JSON.stringify(item.properties, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
