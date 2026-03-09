import { useState } from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { MOCK_STUDENTS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

export default function TeacherDashboard({ activeTab }) {
  const { user } = useAuth();
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [remarkModal, setRemarkModal] = useState(null);
  const [remark, setRemark] = useState('');

  const counts = {
    all: students.length,
    pending: students.filter((s) => s.status === 'pending').length,
    cleared: students.filter((s) => s.status === 'cleared').length,
    held: students.filter((s) => s.status === 'held').length,
    rejected: students.filter((s) => s.status === 'rejected').length,
  };

  const filtered = students
    .filter((s) => filter === 'all' || s.status === filter)
    .filter((s) =>
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    );

  const updateStatus = (id, newStatus, newRemark = '') => {
    setStudents((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: newStatus, remark: newRemark } : s)
    );
  };

  const bulkApprove = () => {
    setStudents((prev) =>
      prev.map((s) => selected.includes(s.id) ? { ...s, status: 'cleared' } : s)
    );
    setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openRemarkModal = (student, nextStatus) => {
    setRemarkModal({ student, nextStatus });
    setRemark('');
  };

  const submitRemark = () => {
    if (remarkModal) {
      updateStatus(remarkModal.student.id, remarkModal.nextStatus, remark);
      setRemarkModal(null);
    }
  };

  // === Dashboard Tab ===
  if (activeTab === 'dashboard') {
    return (
      <div className="animate-fade-in">
        {/* Welcome */}
        <div className="clearance-overview" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="overview-header">
            <div>
              <div className="overview-greeting">
                Welcome, <span>{user.name.split(' ').slice(-1)[0]}</span>! 👋
              </div>
              <div className="overview-subtitle">{user.department}</div>
            </div>
          </div>
          <div className="overview-footer-stats">
            {[
              { num: counts.all, label: 'Total Students' },
              { num: counts.pending, label: 'Pending Review' },
              { num: counts.cleared, label: 'Cleared' },
              { num: counts.held + counts.rejected, label: 'Need Action' },
            ].map((s) => (
              <div key={s.label}>
                <div className="overview-foot-stat-num">{s.num}</div>
                <div className="overview-foot-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          {[
            { label: 'Pending Review', value: counts.pending, color: '#92400e', bg: 'var(--yellow-light)', accent: 'var(--yellow)', icon: '◷' },
            { label: 'Cleared', value: counts.cleared, color: 'var(--green)', bg: 'var(--green-light)', accent: 'var(--green)', icon: '✓' },
            { label: 'On Hold', value: counts.held, color: 'var(--orange)', bg: 'var(--orange-light)', accent: 'var(--orange)', icon: '⊡' },
            { label: 'Rejected', value: counts.rejected, color: 'var(--red)', bg: 'var(--red-light)', accent: 'var(--red)', icon: '✕' },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in"
              style={{ '--accent-color': s.accent }}
            >
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending quick list */}
        <div className="section-header">
          <div>
            <div className="section-title">Needs Attention</div>
            <div className="section-subtitle">Students awaiting your review</div>
          </div>
        </div>

        <StudentTable
          students={students.filter((s) => s.status !== 'cleared').slice(0, 5)}
          selected={selected}
          onToggleSelect={toggleSelect}
          onApprove={(s) => updateStatus(s.id, 'cleared')}
          onReject={(s) => openRemarkModal(s, 'rejected')}
          onHold={(s) => openRemarkModal(s, 'held')}
        />
      </div>
    );
  }

  // === Students / Pending Tab ===
  const showStudents = activeTab === 'students' || activeTab === 'pending' || activeTab === 'cleared';
  if (showStudents) {
    const tabFilter = activeTab === 'pending' ? 'pending' : activeTab === 'cleared' ? 'cleared' : filter;

    return (
      <div className="animate-fade-in">
        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="bulk-actions-bar">
            <span>{selected.length} student{selected.length > 1 ? 's' : ''} selected</span>
            <div className="bulk-actions-buttons">
              <button className="btn btn-success btn-sm" onClick={bulkApprove}>
                ✓ Bulk Approve
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'white' }} onClick={() => setSelected([])}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters & search */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
          {activeTab === 'students' && (
            <div className="teacher-filters" style={{ flex: 1, margin: 0 }}>
              {['all', 'pending', 'cleared', 'held', 'rejected'].map((f) => (
                <button
                  key={f}
                  className={`filter-chip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? 0})
                </button>
              ))}
            </div>
          )}
          <div className="search-wrapper" style={{ minWidth: 220 }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="form-input"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <StudentTable
          students={activeTab === 'students' ? filtered : students.filter((s) => s.status === (activeTab === 'pending' ? 'pending' : 'cleared'))}
          selected={selected}
          onToggleSelect={toggleSelect}
          onApprove={(s) => updateStatus(s.id, 'cleared')}
          onReject={(s) => openRemarkModal(s, 'rejected')}
          onHold={(s) => openRemarkModal(s, 'held')}
        />

        {/* Remark Modal */}
        <Modal
          isOpen={!!remarkModal}
          onClose={() => setRemarkModal(null)}
          title={`${remarkModal?.nextStatus === 'held' ? 'Hold' : 'Reject'} — ${remarkModal?.student?.name}`}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setRemarkModal(null)}>Cancel</button>
              <button
                className={`btn ${remarkModal?.nextStatus === 'held' ? 'btn-outline' : 'btn-danger'}`}
                onClick={submitRemark}
              >
                {remarkModal?.nextStatus === 'held' ? 'Place on Hold' : 'Reject Clearance'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Remark / Reason (required)</label>
            <textarea
              className="form-textarea form-input"
              rows={4}
              placeholder="Explain what the student needs to do..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </Modal>
      </div>
    );
  }

  return null;
}

function StudentTable({ students, selected, onToggleSelect, onApprove, onReject, onHold }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <h3>No students found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) students.forEach((s) => !selected.includes(s.id) && onToggleSelect(s.id));
                  else students.forEach((s) => selected.includes(s.id) && onToggleSelect(s.id));
                }}
                checked={students.length > 0 && students.every((s) => selected.includes(s.id))}
              />
            </th>
            <th>Student</th>
            <th>Course</th>
            <th>Year</th>
            <th>Status</th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => onToggleSelect(s.id)}
                />
              </td>
              <td>
                <div className="user-info-cell">
                  <div className="avatar">{s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                  <div className="user-cell-info">
                    <div className="user-name">{s.name}</div>
                    <div className="user-id">{s.id}</div>
                  </div>
                </div>
              </td>
              <td>{s.course}</td>
              <td>{s.year}</td>
              <td><StatusBadge status={s.status} /></td>
              <td style={{ maxWidth: 200, color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
                {s.remark || <span style={{ color: 'var(--gray-300)' }}>—</span>}
              </td>
              <td>
                {s.status !== 'cleared' && (
                  <div className="student-row-actions">
                    <button
                      className="action-btn action-btn-approve tooltip"
                      data-tip="Approve"
                      onClick={() => onApprove(s)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn action-btn-hold tooltip"
                      data-tip="Hold"
                      onClick={() => onHold(s)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn action-btn-reject tooltip"
                      data-tip="Reject"
                      onClick={() => onReject(s)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                )}
                {s.status === 'cleared' && (
                  <span style={{ color: 'var(--green)', fontSize: '0.875rem', fontWeight: 600 }}>✓ Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}