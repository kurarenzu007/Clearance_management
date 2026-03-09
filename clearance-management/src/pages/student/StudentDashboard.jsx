import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { MOCK_CLEARANCES } from '../../utils/mockData';
import '../../styles/dashboard.css';

const statusOrder = { rejected: 0, held: 1, pending: 2, cleared: 3 };

export default function StudentDashboard({ activeTab }) {
  const { user } = useAuth();
  const [clearances] = useState(MOCK_CLEARANCES);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState('all');

  const counts = {
    total: clearances.length,
    cleared: clearances.filter((c) => c.status === 'cleared').length,
    pending: clearances.filter((c) => c.status === 'pending').length,
    held: clearances.filter((c) => c.status === 'held').length,
    rejected: clearances.filter((c) => c.status === 'rejected').length,
  };

  const pct = Math.round((counts.cleared / counts.total) * 100);
  const isFullyCleared = counts.cleared === counts.total;

  const filtered = filter === 'all'
    ? [...clearances].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    : clearances.filter((c) => c.status === filter);

  // === Dashboard Tab ===
  if (activeTab === 'dashboard') {
    return (
      <div className="animate-fade-in">
        {/* Overview hero card */}
        <div className="clearance-overview">
          <div className="overview-header">
            <div>
              <div className="overview-greeting">
                Hello, <span>{user.name.split(' ')[0]}</span>! 👋
              </div>
              <div className="overview-subtitle">
                {user.course} · {user.year} · {user.section}
              </div>
            </div>
            <div className="overview-status-chip">
              {isFullyCleared ? '✓ Fully Cleared' : `${counts.pending + counts.held + counts.rejected} Remaining`}
            </div>
          </div>

          <div className="overview-progress-section">
            <div className="overview-progress-label">
              <span>Overall Clearance Progress</span>
              <span className="overview-progress-pct">{pct}%</span>
            </div>
            <div className="overview-progress-bar">
              <div
                className="overview-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="overview-footer-stats">
            {[
              { num: counts.cleared, label: 'Cleared' },
              { num: counts.pending, label: 'Pending' },
              { num: counts.held, label: 'On Hold' },
              { num: counts.rejected, label: 'Rejected' },
            ].map((s) => (
              <div key={s.label}>
                <div className="overview-foot-stat-num">{s.num}</div>
                <div className="overview-foot-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="stats-grid stagger-children">
          {[
            {
              label: 'Total Requirements',
              value: counts.total,
              icon: '◈',
              color: '#003DA5',
              bg: '#e8effc',
              accent: '#003DA5',
            },
            {
              label: 'Cleared',
              value: counts.cleared,
              icon: '✓',
              color: 'var(--green)',
              bg: 'var(--green-light)',
              accent: 'var(--green)',
            },
            {
              label: 'Pending Review',
              value: counts.pending,
              icon: '◷',
              color: '#92400e',
              bg: 'var(--yellow-light)',
              accent: 'var(--yellow)',
            },
            {
              label: 'Needs Attention',
              value: counts.held + counts.rejected,
              icon: '!',
              color: 'var(--red)',
              bg: 'var(--red-light)',
              accent: 'var(--red)',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in"
              style={{ '--accent-color': s.accent }}
            >
              <div
                className="stat-icon"
                style={{ background: s.bg, color: s.color, fontSize: '1.25rem' }}
              >
                {s.icon}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent clearances (top 4) */}
        <div className="section-header">
          <div>
            <div className="section-title">Recent Updates</div>
            <div className="section-subtitle">Your latest clearance activity</div>
          </div>
        </div>

        <div className="clearance-grid stagger-children">
          {clearances
            .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
            .slice(0, 4)
            .map((c) => (
              <ClearanceCard
                key={c.id}
                clearance={c}
                onClick={() => setSelectedCard(c)}
              />
            ))}
        </div>
      </div>
    );
  }

  // === Clearance Tab ===
  if (activeTab === 'clearance') {
    return (
      <div className="animate-fade-in">
        <div className="section-header">
          <div>
            <div className="section-title">My Clearance Status</div>
            <div className="section-subtitle">
              {counts.cleared} of {counts.total} requirements cleared
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="teacher-filters" style={{ marginBottom: 'var(--space-5)' }}>
          {[
            { id: 'all', label: `All (${counts.total})` },
            { id: 'cleared', label: `Cleared (${counts.cleared})` },
            { id: 'pending', label: `Pending (${counts.pending})` },
            { id: 'held', label: `On Hold (${counts.held})` },
            { id: 'rejected', label: `Rejected (${counts.rejected})` },
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="clearance-grid stagger-children">
          {filtered.map((c) => (
            <ClearanceCard
              key={c.id}
              clearance={c}
              onClick={() => setSelectedCard(c)}
            />
          ))}
        </div>

        {selectedCard && (
          <Modal
            isOpen={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            title="Clearance Details"
            footer={
              <button className="btn btn-primary" onClick={() => setSelectedCard(null)}>
                Close
              </button>
            }
          >
            <ClearanceDetailContent clearance={selectedCard} />
          </Modal>
        )}
      </div>
    );
  }

  // === Certificate Tab ===
  if (activeTab === 'certificate') {
    return (
      <div className="animate-fade-in">
        {isFullyCleared ? (
          <div className="certificate-ready">
            <div className="certificate-icon">🎓</div>
            <div className="certificate-title">Clearance Certificate Ready!</div>
            <div className="certificate-sub">
              All requirements have been cleared. Download your certificate now.
            </div>
            <button className="btn btn-yellow btn-lg" style={{ marginTop: 'var(--space-2)' }}>
              ↓ Download PDF Certificate
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Certificate Not Yet Available
            </h3>
            <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
              You need to complete all clearance requirements before your certificate can be generated.
              You still have <strong>{counts.total - counts.cleared}</strong> remaining.
            </p>
            <div className="progress-bar" style={{ maxWidth: 320, margin: '0 auto' }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {pct}% complete
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function ClearanceCard({ clearance, onClick }) {
  return (
    <div
      className={`clearance-card card-hover animate-fade-in ${clearance.status}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="clearance-card-top">
        <div>
          <div className="subject-name">{clearance.subject}</div>
          <div className="subject-code">{clearance.code}</div>
        </div>
        <StatusBadge status={clearance.status} />
      </div>

      <div className="clearance-card-teacher">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {clearance.teacher}
      </div>

      {clearance.remark && (
        <div className="clearance-card-remark">{clearance.remark}</div>
      )}

      {clearance.status === 'cleared' && clearance.clearedAt && (
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>
          Cleared on {new Date(clearance.clearedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  );
}

function ClearanceDetailContent({ clearance }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{clearance.subject}</div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>{clearance.code}</div>
        </div>
        <StatusBadge status={clearance.status} />
      </div>
      <div className="divider" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Teacher</div>
          <div style={{ fontWeight: 500 }}>{clearance.teacher}</div>
        </div>
        {clearance.clearedAt && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cleared Date</div>
            <div style={{ fontWeight: 500 }}>{new Date(clearance.clearedAt).toLocaleDateString('en-PH', { dateStyle: 'long' })}</div>
          </div>
        )}
      </div>
      {clearance.remark && (
        <>
          <div className="divider" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Remark from Teacher</div>
            <div style={{
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontSize: '0.9375rem',
              color: 'var(--gray-700)',
              lineHeight: 1.6,
            }}>
              {clearance.remark}
            </div>
          </div>
        </>
      )}
    </div>
  );
}