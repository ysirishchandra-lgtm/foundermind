import { FileText, Download } from 'lucide-react';
import { mockDocuments } from '../../data/mockData';
import EmptyState from '../../components/EmptyState';

export default function Documents() {
  return (
    <div className="animate-fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Your generated and uploaded files.</p>
        </div>
      </div>

      <div className="glass-card widget-card">
        <div className="widget-content">
          {mockDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded"
              description="Generated emails, strategy summaries, and board updates will populate here."
            />
          ) : (
            mockDocuments.map(doc => (
              <div key={doc.id} className="list-item" style={{ padding: '16px' }}>
                <div className="item-left" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="item-title">{doc.name}</span>
                    <span className="item-meta">{doc.type} • {doc.size}</span>
                  </div>
                </div>
                <button className="btn-icon"><Download size={18} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
