'use client';

import { useEffect, useState } from 'react';
import { examsApi, emailApi, Exam, collegesApi, College } from '@/lib/api';
import {
  RefreshCw,
  Pencil,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingDown,
  Activity,
  X,
  Loader2,
  Send,
} from 'lucide-react';

export default function BloomJoinSync() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modificationData, setModificationData] = useState({
    questionId: '',
    changeType: 'update' as 'add' | 'remove' | 'update',
    description: '',
  });
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, collegesData] = await Promise.all([
        examsApi.getAll(),
        collegesApi.getAll(),
      ]);
      setExams(examsData.filter((e) => e.status === 'distributed' || e.status === 'modified'));
      setColleges(collegesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    setSyncing(true);
    try {
      const result = await examsApi.modify(selectedExam.id, [modificationData]);
      const affectedColleges = selectedExam.distributions.map((d) => ({
        id: d.collegeId,
        name: d.collegeName,
        email: d.email,
      }));

      await emailApi.notifyModification(
        selectedExam.title,
        [{ changeType: modificationData.changeType, description: modificationData.description }],
        affectedColleges
      );

      setSyncResults(result);
      setShowModifyModal(false);
      setModificationData({ questionId: '', changeType: 'update', description: '' });
      loadData();
    } catch (error) {
      console.error('Failed to modify exam:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="mb-md">
        <h1 className="text-2xl font-bold flex items-center gap-sm">
          <span className="icon-wrapper icon-wrapper-md bg-[var(--accent-glow)] text-[var(--accent-primary)] animate-float">
            <RefreshCw size={20} />
          </span>
          BloomJoin Synchronization
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Efficiently sync exam modifications across distributed college sites using bloom filters
        </p>
      </div>

      {/* BloomJoin Explanation */}
      <div className="card glass">
        <div className="bloomjoin-grid">
          <div>
            <h3 className="text-base font-semibold" style={{ marginBottom: '16px' }}>How BloomJoin Works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="step-item">
                <div className="step-number bg-blue-500/20 text-blue-400">1</div>
                <div className="step-content">
                  <h4>Create Bloom Filter</h4>
                  <p>Admin creates a bloom filter F(T1) from modified question IDs</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number bg-purple-500/20 text-purple-400">2</div>
                <div className="step-content">
                  <h4>Filter Records</h4>
                  <p>Colleges filter local records against F(T1) to find matches</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number bg-green-500/20 text-green-400">3</div>
                <div className="step-content">
                  <h4>Compute Join</h4>
                  <p>Only matching records are synced, minimizing network cost</p>
                </div>
              </div>
            </div>
          </div>
          <div className="efficiency-panel">
            <div className="efficiency-header">
              <div className="efficiency-icon">
                <Activity size={18} />
              </div>
              <div>
                <h4>Network Efficiency</h4>
                <p>Bandwidth comparison</p>
              </div>
            </div>
            
            <div className="efficiency-stats">
              <div className="efficiency-stat">
                <div className="stat-header">
                  <span className="stat-label">Without BloomJoin</span>
                  <span className="stat-value text-red-400">100%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-bar-fill bg-red-500" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="efficiency-stat">
                <div className="stat-header">
                  <span className="stat-label">With BloomJoin</span>
                  <span className="stat-value text-green-400">~15%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-bar-fill bg-green-500" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="efficiency-savings">
              <div className="savings-badge">
                <TrendingDown size={16} />
                <span>85%</span>
              </div>
              <p>reduction in network traffic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distributed Exams */}
      <div className="card">
        <h3 className="text-base font-semibold mb-md flex items-center gap-sm">
          <Send size={18} className="text-[var(--accent-primary)]" />
          Distributed Exams
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg"></div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            <Send size={36} className="mx-auto mb-3 opacity-50" />
            <p>No distributed exams found</p>
            <p className="text-sm mt-1">Distribute an exam first to use BloomJoin sync</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{exam.title}</h4>
                      <span className={`badge ${exam.status === 'modified' ? 'badge-warning' : 'badge-success'}`}>
                        {exam.status}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">v{exam.version}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Distributed to {exam.distributions.length} college{exam.distributions.length !== 1 ? 's' : ''} •{' '}
                      {exam.modifications.length} modification{exam.modifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowModifyModal(true);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    <Pencil size={14} /> Modify
                  </button>
                </div>

                {exam.modifications.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Recent Modifications:</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.modifications.slice(-3).map((mod) => (
                        <span
                          key={mod.id}
                          className={`badge ${
                            mod.changeType === 'add'
                              ? 'badge-success'
                              : mod.changeType === 'remove'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {mod.changeType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Results */}
      {syncResults && (
        <div className="card animate-fade-in">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            Sync Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-xl font-bold text-green-400">
                {syncResults.syncData?.modificationsToSync?.length || 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Modifications Synced</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-xl font-bold text-blue-400">
                {syncResults.syncData?.affectedColleges?.length || 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Colleges Notified</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-xl font-bold text-purple-400">
                {syncResults.syncData?.filter?.size || 1024}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Bloom Filter Size</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-400 flex items-center gap-2">
              <Zap size={14} />
              BloomJoin sync completed. All affected colleges notified.
            </p>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowModifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Modify Distributed Exam</h2>
              <button onClick={() => setShowModifyModal(false)} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {selectedExam.title} — Will sync to {selectedExam.distributions.length} college(s)
            </p>

            <form onSubmit={handleModify} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Change Type *</label>
                <select
                  className="select"
                  value={modificationData.changeType}
                  onChange={(e) =>
                    setModificationData({
                      ...modificationData,
                      changeType: e.target.value as 'add' | 'remove' | 'update',
                    })
                  }
                >
                  <option value="update">Update Question</option>
                  <option value="add">Add Question</option>
                  <option value="remove">Remove Question</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Question ID *</label>
                <input
                  type="text"
                  className="input"
                  value={modificationData.questionId}
                  onChange={(e) =>
                    setModificationData({ ...modificationData, questionId: e.target.value })
                  }
                  required
                  placeholder="Enter question ID"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Description *</label>
                <textarea
                  className="input min-h-[80px]"
                  value={modificationData.description}
                  onChange={(e) =>
                    setModificationData({ ...modificationData, description: e.target.value })
                  }
                  required
                  placeholder="Describe the modification..."
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  This will sync to {selectedExam.distributions.length} college(s) using BloomJoin.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={syncing} className="btn btn-primary flex-1">
                  {syncing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Syncing...
                    </span>
                  ) : (
                    <>
                      <RefreshCw size={16} /> Apply & Sync
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

