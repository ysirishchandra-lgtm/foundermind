import { useState, useEffect } from 'react';
import { FileText, Download, Plus, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null); // null for create, object for edit
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Email');
  const [docContent, setDocContent] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setCurrentDoc(null);
    setDocName('');
    setDocType('Email');
    setDocContent('');
    setShowModal(true);
  };

  const handleOpenEdit = (doc) => {
    setCurrentDoc(doc);
    setDocName(doc.name);
    setDocType(doc.type);
    setDocContent(doc.content || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      setSaving(true);
      const fields = {
        name: docName,
        type: docType,
        size: `${Math.round((docContent.length * 2) / 1024 * 10) / 10} KB`,
        content: docContent
      };

      if (currentDoc) {
        // Update existing
        await api.patch(`/documents/${currentDoc.id}`, fields);
        showNotification('Document updated successfully!');
      } else {
        // Create new
        await api.post('/documents', fields);
        showNotification('Document created successfully!');
      }
      setShowModal(false);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Error saving document.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      showNotification('Document deleted.');
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Error deleting document.');
    }
  };

  return (
    <div className="animate-fade-up" style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'rgba(16, 185, 129, 0.9)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fade-in 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Your generated and uploaded files.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Document
        </button>
      </div>

      {loading ? (
        <div className="glass-card widget-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-blue)' }} />
        </div>
      ) : error ? (
        <div className="glass-card widget-card" style={{ padding: '24px', color: '#ef4444', textAlign: 'center' }}>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchDocuments} style={{ marginTop: '12px' }}>Retry</button>
        </div>
      ) : (
        <div className="glass-card widget-card">
          <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents uploaded"
                description="Generated emails, strategy summaries, and board updates will populate here."
              />
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="list-item" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="item-left" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="item-title" style={{ fontWeight: 600 }}>{doc.name}</span>
                      <span className="item-meta" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{doc.type} • {doc.size}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" onClick={() => handleOpenEdit(doc)} style={{ color: 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}><Edit2 size={18} /></button>
                    <button className="btn-icon" onClick={() => handleDelete(doc.id)} style={{ color: '#ef4444', transition: 'all 0.2s' }}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Glassmorphic Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '550px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {currentDoc ? 'Edit Document' : 'New Document'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Document Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Investor Pitch Draft"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="Email" style={{ background: '#0e1117' }}>Email</option>
                  <option value="Update" style={{ background: '#0e1117' }}>Update</option>
                  <option value="PDF" style={{ background: '#0e1117' }}>PDF</option>
                  <option value="Doc" style={{ background: '#0e1117' }}>Doc</option>
                  <option value="Strategy" style={{ background: '#0e1117' }}>Strategy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Content</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste or write the document text here..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 24px' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
