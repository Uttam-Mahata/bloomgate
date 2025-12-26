'use client';

import { useEffect, useState } from 'react';
import { examsApi, emailApi, Exam, College, collegesApi } from '@/lib/api';

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
      // Perform modification using BloomJoin
      const result = await examsApi.modify(selectedExam.id, [modificationData]);

      // Send notifications to affected colleges
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl animate-float">🔄</span>
          BloomJoin Synchronization
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Efficiently sync exam modifications across distributed college sites using bloom filters
        </p>
      </div>

      {/* BloomJoin Explanation */}
      <div className="card glass">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">How BloomJoin Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Create Bloom Filter</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Admin site creates a bloom filter F(T1) from modified question IDs
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Filter Records</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    College sites filter local records against F(T1) to find matches (T0)
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Compute Join</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Only matching records T0 are synced, minimizing network cost
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-80">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
              <p className="text-sm text-[var(--text-muted)] mb-3">Network Efficiency</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Without BloomJoin</span>
                    <span className="text-red-400">100%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full bg-red-500" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>With BloomJoin</span>
                    <span className="text-green-400">~15%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full bg-green-500" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                Up to 85% reduction in network traffic
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distributed Exams */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📋</span> Distributed Exams
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg"></div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <p className="text-4xl mb-3">📭</p>
            <p>No distributed exams found</p>
            <p className="text-sm mt-1">Distribute an exam first to use BloomJoin sync</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{exam.title}</h4>
                      <span
                        className={`badge ${
                          exam.status === 'modified' ? 'badge-warning' : 'badge-success'
                        }`}
                      >
                        {exam.status}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        v{exam.version}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      Distributed to {exam.distributions.length} college
                      {exam.distributions.length !== 1 ? 's' : ''} •{' '}
                      {exam.modifications.length} modification
                      {exam.modifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowModifyModal(true);
                    }}
                    className="btn btn-secondary"
                  >
                    ✏️ Modify
                  </button>
                </div>

                {exam.modifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-sm text-[var(--text-muted)] mb-2">Recent Modifications:</p>
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
                          {mod.changeType}: {mod.description.slice(0, 30)}
                          {mod.description.length > 30 ? '...' : ''}
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
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>✅</span> Sync Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-2xl font-bold text-green-400">
                {syncResults.syncData?.modificationsToSync?.length || 0}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Modifications Synced</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-2xl font-bold text-blue-400">
                {syncResults.syncData?.affectedColleges?.length || 0}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Colleges Notified</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <p className="text-2xl font-bold text-purple-400">
                {syncResults.syncData?.filter?.size || 1024}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Bloom Filter Size</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-400">
              ✓ BloomJoin sync completed successfully. All affected colleges have been notified
              of the modifications.
            </p>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowModifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Modify Distributed Exam</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {selectedExam.title} - This will trigger a BloomJoin sync to all{' '}
              {selectedExam.distributions.length} college(s)
            </p>

            <form onSubmit={handleModify} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Change Type *
                </label>
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
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Question ID *
                </label>
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
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Description *
                </label>
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

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-400">
                  ⚠️ This modification will be synced to {selectedExam.distributions.length}{' '}
                  college(s) using BloomJoin. All affected institutions will receive email
                  notifications.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={syncing} className="btn btn-primary flex-1">
                  {syncing ? (
                    <span className="animate-pulse">Syncing...</span>
                  ) : (
                    <>
                      <span>🔄</span> Apply & Sync
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

