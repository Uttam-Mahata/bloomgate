'use client';

import { useEffect, useState } from 'react';
import { examsApi, Exam } from '@/lib/api';
import {
  Eye,
  FileText,
  Send,
  Trash2,
  Clock,
  Award,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exam Papers</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            View and manage all created exam papers
          </p>
        </div>
        <span className="text-sm text-[var(--text-muted)]">{exams.length} exams total</span>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <p className="text-lg font-medium">No exam papers yet</p>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            Generate your first exam paper to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam, index) => (
            <div
              key={exam.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${statusColors[exam.status]}`}>{exam.status}</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">v{exam.version}</span>
              </div>

              <h3 className="font-semibold text-base mb-1 line-clamp-1">{exam.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">{exam.subject}</p>

              <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <Clock size={14} className="text-[var(--text-muted)]" />
                    {exam.duration}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">min</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <Award size={14} className="text-[var(--text-muted)]" />
                    {exam.totalMarks}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">marks</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <Layers size={14} className="text-[var(--text-muted)]" />
                    {exam.sections.length}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">sections</p>
                </div>
              </div>

              {exam.distributions.length > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                  <p className="text-xs text-[var(--text-muted)]">Distributed to</p>
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
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => onViewPdf(exam.id)}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <FileText size={16} /> PDF
                </button>
                {exam.status === 'draft' && (
                  <button
                    onClick={() => onDistribute(exam)}
                    className="btn btn-primary btn-icon"
                    title="Distribute"
                  >
                    <Send size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="btn btn-ghost btn-icon text-red-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
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
            className="modal-content max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedExam.title}</h2>
                <p className="text-[var(--text-secondary)] text-sm">{selectedExam.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${statusColors[selectedExam.status]}`}>
                  {selectedExam.status}
                </span>
                <button onClick={() => setShowDetails(false)} className="btn btn-ghost btn-icon">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-xl font-bold">{selectedExam.duration}</p>
                <p className="text-xs text-[var(--text-muted)]">Duration (min)</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-xl font-bold">{selectedExam.totalMarks}</p>
                <p className="text-xs text-[var(--text-muted)]">Total Marks</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-xl font-bold">{selectedExam.passingMarks}</p>
                <p className="text-xs text-[var(--text-muted)]">Passing</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-xl font-bold">v{selectedExam.version}</p>
                <p className="text-xs text-[var(--text-muted)]">Version</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-2">Instructions</h3>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] whitespace-pre-line text-sm max-h-32 overflow-y-auto">
                {selectedExam.instructions}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-2">Sections ({selectedExam.sections.length})</h3>
              <div className="space-y-2">
                {selectedExam.sections.map((section, index) => (
                  <div key={section.id} className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {section.questionIds.length} questions • {section.totalMarks} marks
                        </p>
                      </div>
                      <span className="badge badge-info">Section {index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedExam.distributions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2">
                  Distributions ({selectedExam.distributions.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedExam.distributions.map((dist) => (
                    <div
                      key={dist.collegeId}
                      className="flex justify-between items-center p-2 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div>
                        <p className="font-medium text-sm">{dist.collegeName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{dist.email}</p>
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
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400" />
                  Modifications ({selectedExam.modifications.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedExam.modifications.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex justify-between items-center p-2 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div className="flex items-center gap-2">
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
                        <span className="text-sm">{mod.description.slice(0, 40)}...</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(mod.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <button onClick={() => setShowDetails(false)} className="btn btn-secondary flex-1">
                Close
              </button>
              <button onClick={() => onViewPdf(selectedExam.id)} className="btn btn-primary flex-1">
                <FileText size={18} /> View PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
