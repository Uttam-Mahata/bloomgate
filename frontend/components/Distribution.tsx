'use client';

import { useEffect, useState } from 'react';
import { examsApi, collegesApi, emailApi, Exam, College } from '@/lib/api';
import {
  Send,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  History,
  Loader2,
} from 'lucide-react';

export default function Distribution() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [distributing, setDistributing] = useState(false);
  const [distributionLog, setDistributionLog] = useState<
    { collegeName: string; status: string; time: string }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, collegesData] = await Promise.all([
        examsApi.getAll(),
        collegesApi.getAll(),
      ]);
      setExams(examsData);
      setColleges(collegesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!selectedExam || selectedColleges.length === 0) return;

    setDistributing(true);
    setDistributionLog([]);

    try {
      const { html: pdfHtml, exam } = await examsApi.getPdfContent(selectedExam);
      const selectedCollegeDetails = colleges
        .filter((c) => selectedColleges.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name, email: c.email }));

      await examsApi.distribute(selectedExam, selectedColleges);
      const emailResults = await emailApi.distribute(exam.title, pdfHtml, selectedCollegeDetails);

      const logs = emailResults.map((r: { collegeName: string; status: string; timestamp: string }) => ({
        collegeName: r.collegeName,
        status: r.status,
        time: new Date(r.timestamp).toLocaleTimeString(),
      }));
      setDistributionLog(logs);
      loadData();
    } catch (error) {
      console.error('Failed to distribute exam:', error);
    } finally {
      setDistributing(false);
    }
  };

  const toggleCollege = (id: string) => {
    setSelectedColleges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAllColleges = () => setSelectedColleges(colleges.map((c) => c.id));
  const deselectAllColleges = () => setSelectedColleges([]);

  const distributedExams = exams.filter((e) => e.status === 'distributed' || e.status === 'modified');
  const draftExams = exams.filter((e) => e.status === 'draft');

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="mb-md">
        <h1 className="text-2xl font-bold flex items-center gap-sm">
          <Send size={24} className="text-[var(--accent-primary)]" />
          Exam Distribution
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Distribute exam papers to colleges via email with PDF attachments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Distribution Panel */}
        <div className="lg:col-span-2 space-y-md">
          {/* Exam Selection */}
          <div className="card">
            <h3 className="text-base font-semibold mb-md flex items-center gap-sm">
              <FileText size={18} className="text-[var(--accent-primary)]" />
              Select Exam Paper
            </h3>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-lg"></div>
                ))}
              </div>
            ) : draftExams.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <FileText size={36} className="mx-auto mb-3 opacity-50" />
                <p>No draft exams available for distribution</p>
                <p className="text-sm mt-1">Generate a new exam first</p>
              </div>
            ) : (
              <div className="space-y-2">
                {draftExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedExam === exam.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{exam.title}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {exam.subject} • {exam.duration} min • {exam.totalMarks} marks
                        </p>
                      </div>
                      <span className="badge badge-warning">{exam.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* College Selection */}
          <div className="card">
            <div className="college-selection-header">
              <div className="college-selection-title">
                <Building2 size={18} className="text-[var(--accent-primary)]" />
                <div>
                  <h3>Select Colleges</h3>
                  <p>{selectedColleges.length} of {colleges.length} selected</p>
                </div>
              </div>
              <div className="college-selection-actions">
                <button onClick={selectAllColleges} className="action-btn">
                  <CheckCircle size={14} />
                  All
                </button>
                <button onClick={deselectAllColleges} className="action-btn">
                  <XCircle size={14} />
                  Clear
                </button>
              </div>
            </div>

            {loading ? (
              <div className="college-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg"></div>
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Building2 size={36} className="mx-auto mb-3 opacity-50" />
                <p>No colleges registered</p>
              </div>
            ) : (
              <div className="college-grid">
                {colleges.map((college) => {
                  const isSelected = selectedColleges.includes(college.id);
                  return (
                    <button
                      key={college.id}
                      onClick={() => toggleCollege(college.id)}
                      className={`college-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className={`college-checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <CheckCircle size={12} />}
                      </div>
                      <div className="college-info">
                        <span className="college-name">{college.name}</span>
                        <span className="college-email">{college.email}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Distribute Button */}
          <button
            onClick={handleDistribute}
            disabled={!selectedExam || selectedColleges.length === 0 || distributing}
            className="btn btn-primary w-full py-3"
          >
            {distributing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Distributing...
              </span>
            ) : (
              <>
                <Send size={18} />
                Distribute to {selectedColleges.length} College
                {selectedColleges.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {/* Distribution Log */}
          {distributionLog.length > 0 && (
            <div className="card animate-fade-in">
              <h3 className="text-base font-semibold mb-md flex items-center gap-sm">
                <History size={18} className="text-[var(--accent-primary)]" />
                Distribution Log
              </h3>
              <div className="space-y-sm">
                {distributionLog.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === 'sent' ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      <span className="text-sm">{log.collegeName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${log.status === 'sent' ? 'badge-success' : 'badge-error'}`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-icon">
                <BarChart3 size={18} />
              </div>
              <h3>Distribution Stats</h3>
            </div>
            <div className="stats-card-body">
              <div className="stats-main">
                <div className="stats-main-value">{distributedExams.length}</div>
                <div className="stats-main-label">Exams Distributed</div>
              </div>
              <div className="stats-grid">
                <div className="stats-item">
                  <div className="stats-item-icon bg-blue-500/15 text-blue-400">
                    <Building2 size={16} />
                  </div>
                  <div className="stats-item-content">
                    <span className="stats-item-value">{colleges.length}</span>
                    <span className="stats-item-label">Colleges</span>
                  </div>
                </div>
                <div className="stats-item">
                  <div className="stats-item-icon bg-amber-500/15 text-amber-400">
                    <Clock size={16} />
                  </div>
                  <div className="stats-item-content">
                    <span className="stats-item-value">{draftExams.length}</span>
                    <span className="stats-item-label">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-[var(--accent-primary)]" />
              Recent Distributions
            </h3>
            {distributedExams.length === 0 ? (
              <p className="text-center py-6 text-[var(--text-muted)] text-sm">
                No distributions yet
              </p>
            ) : (
              <div className="space-y-2">
                {distributedExams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="font-medium text-sm truncate">{exam.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        {exam.distributions.length} college{exam.distributions.length !== 1 ? 's' : ''}
                      </span>
                      <span className={`badge ${exam.status === 'modified' ? 'badge-warning' : 'badge-success'}`}>
                        {exam.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
