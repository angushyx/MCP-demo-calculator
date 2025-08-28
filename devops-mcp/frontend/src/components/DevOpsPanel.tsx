import React, { useState } from 'react';
import { devops } from '../services/devops';

export default function DevOpsPanel() {
  const [diff, setDiff] = useState('');
  const [patch, setPatch] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true); 
    setPatch('');
    try { 
      const text = await devops.generatePatch(diff); 
      setPatch(text); 
    } catch (error) {
      console.error('Error generating patch:', error);
      alert('Failed to generate patch');
    } finally { 
      setLoading(false); 
    }
  };

  const onSummary = async () => {
    setLoading(true); 
    setSummary('');
    try { 
      const md = await devops.summarize(diff); 
      setSummary(md); 
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>DevOps • AI Docs Assistant</h2>
      <textarea 
        value={diff} 
        onChange={e=>setDiff(e.target.value)} 
        placeholder="Paste a unified diff here..." 
        style={{ 
          width:'100%', 
          height: 260, 
          padding: 12, 
          border:'1px solid #e5e7eb', 
          borderRadius: 8, 
          fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
          fontSize: 13
        }} 
      />
      <div style={{ display:'flex', gap:8, marginTop: 12 }}>
        <button 
          onClick={onGenerate} 
          disabled={!diff || loading} 
          style={{ 
            padding:'8px 16px', 
            background: !diff || loading ? '#9ca3af' : '#2563eb', 
            color:'#fff', 
            border:'none', 
            borderRadius:8,
            cursor: !diff || loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Generate Patch'}
        </button>
        <button 
          onClick={onSummary} 
          disabled={!diff || loading} 
          style={{ 
            padding:'8px 16px', 
            background: !diff || loading ? '#9ca3af' : '#111827', 
            color:'#fff', 
            border:'none', 
            borderRadius:8,
            cursor: !diff || loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Summarize'}
        </button>
      </div>

      {patch && (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Generated Patch</h3>
          <pre style={{ 
            background:'#0b1020', 
            color:'#e5e7eb', 
            padding:12, 
            borderRadius:8, 
            overflow:'auto', 
            maxHeight: 360,
            fontSize: 12,
            lineHeight: 1.5
          }}>
            {patch}
          </pre>
        </section>
      )}

      {summary && (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Summary</h3>
          <div style={{ 
            background:'#f9fafb', 
            padding:16, 
            border:'1px solid #e5e7eb', 
            borderRadius:8, 
            whiteSpace:'pre-wrap',
            lineHeight: 1.6
          }}>
            {summary}
          </div>
        </section>
      )}
    </div>
  );
}
