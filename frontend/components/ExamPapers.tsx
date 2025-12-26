'use client';

import { useEffect, useState } from 'react';
import { examsApi, Exam } from '@/lib/api';

interface ExamPapersProps {
  onViewPdf: (examId: string) => void;
  onDistribute: (exam: Exam) => void;
}

export default function ExamPapers({ onViewPdf, onDistribute }: ExamPapersProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await examsApi.getAll();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examsApi.delete(id);
      loadExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
    }
  };

  const viewDetails = async (exam: Exam) => {
    try {
      const fullExam = await examsApi.getFull(exam.id);
      setSelectedExam(fullExam.exam);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load exam details:', error);
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'badge-warning',
    published: 'badge-info',
    distributed: 'badge-success',
    modified: 'badge-info',
    completed: 'badge-success',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Papers</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            View and manage all created exam papers
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm text-[var(--text-muted)]">{exams.length} exams total</span>
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-medium">No exam papers yet</p>
          <p className="text-[var(--text-muted)] mt-1">
            Generate your first exam paper to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => (
            <div
              key={exam.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`badge ${statusColors[exam.status]}`}>{exam.status}</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">v{exam.version}</span>
              </div>

              <h3 className="font-semibold text-lg mb-2">{exam.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">{exam.subject}</p>

              <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-[var(--border-subtle)]">
                <div>
                  <p className="text-2xl font-bold">{exam.duration}</p>
                  <p className="text-xs text-[var(--text-muted)]">minutes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{exam.totalMarks}</p>
                  <p className="text-xs text-[var(--text-muted)]">marks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{exam.sections.length}</p>
                  <p className="text-xs text-[var(--text-muted)]">sections</p>
                </div>
              </div>

              {exam.distributions.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Distributed to</p>
                  <p className="text-sm font-medium">
                    {exam.distributions.length} college{exam.distributions.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => viewDetails(exam)}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => onViewPdf(exam.id)}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  📄 PDF
                </button>
                {exam.status === 'draft' && (
                  <button
                    onClick={() => onDistribute(exam)}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    📤
                  </button>
                )}
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="btn btn-ghost text-sm text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Details Modal */}
      {showDetails && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div
            className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedExam.title}</h2>
                <p className="text-[var(--text-secondary)]">{selectedExam.subject}</p>
              </div>
              <span className={`badge ${statusColors[selectedExam.status]}`}>
                {selectedExam.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-2xl font-bold">{selectedExam.duration}</p>
                <p className="text-xs text-[var(--text-muted)]">Duration (min)</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-2xl font-bold">{selectedExam.totalMarks}</p>
                <p className="text-xs text-[var(--text-muted)]">Total Marks</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-2xl font-bold">{selectedExam.passingMarks}</p>
                <p className="text-xs text-[var(--text-muted)]">Passing</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-2xl font-bold">v{selectedExam.version}</p>
                <p className="text-xs text-[var(--text-muted)]">Version</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Instructions</h3>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] whitespace-pre-line text-sm">
                {selectedExam.instructions}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Sections ({selectedExam.sections.length})</h3>
              <div className="space-y-3">
                {selectedExam.sections.map((section, index) => (
                  <div key={section.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {section.questionIds.length} questions • {section.totalMarks} marks
                        </p>
                      </div>
                      <span className="badge badge-info">Section {index + 1}</span>
                    </div>
                    {section.instructions && (
                      <p className="text-sm text-[var(--text-secondary)] mt-2 italic">
                        {section.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedExam.distributions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">
                  Distributions ({selectedExam.distributions.length})
                </h3>
                <div className="space-y-2">
                  {selectedExam.distributions.map((dist) => (
                    <div
                      key={dist.collegeId}
                      className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div>
                        <p className="font-medium">{dist.collegeName}</p>
                        <p className="text-sm text-[var(--text-muted)]">{dist.email}</p>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(dist.distributedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExam.modifications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Modifications ({selectedExam.modifications.length})
                </h3>
                <div className="space-y-2">
                  {selectedExam.modifications.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
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
                        <span className="text-sm">{mod.description}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(mod.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
              <button onClick={() => setShowDetails(false)} className="btn btn-secondary flex-1">
                Close
              </button>
              <button onClick={() => onViewPdf(selectedExam.id)} className="btn btn-primary flex-1">
                📄 View PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

