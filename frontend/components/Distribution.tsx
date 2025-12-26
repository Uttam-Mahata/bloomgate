'use client';

import { useEffect, useState } from 'react';
import { examsApi, collegesApi, emailApi, Exam, College } from '@/lib/api';

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
      // Get exam PDF content
      const { html: pdfHtml, exam } = await examsApi.getPdfContent(selectedExam);

      // Get selected college details
      const selectedCollegeDetails = colleges
        .filter((c) => selectedColleges.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name, email: c.email }));

      // Distribute via API
      await examsApi.distribute(selectedExam, selectedColleges);

      // Send emails
      const emailResults = await emailApi.distribute(exam.title, pdfHtml, selectedCollegeDetails);

      // Update distribution log
      const logs = emailResults.map((r: { collegeName: string; status: string; timestamp: string }) => ({
        collegeName: r.collegeName,
        status: r.status,
        time: new Date(r.timestamp).toLocaleTimeString(),
      }));
      setDistributionLog(logs);

      // Reload exams to reflect new distribution status
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

  const selectAllColleges = () => {
    setSelectedColleges(colleges.map((c) => c.id));
  };

  const deselectAllColleges = () => {
    setSelectedColleges([]);
  };

  const distributedExams = exams.filter(
    (e) => e.status === 'distributed' || e.status === 'modified'
  );
  const draftExams = exams.filter((e) => e.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">📤</span>
          Exam Distribution
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Distribute exam papers to colleges via email with PDF attachments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> Select Exam Paper
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg"></div>
                ))}
              </div>
            ) : draftExams.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <p className="text-4xl mb-3">📄</p>
                <p>No draft exams available for distribution</p>
                <p className="text-sm mt-1">Generate a new exam first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {draftExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedExam === exam.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-sm text-[var(--text-muted)]">
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>🏛️</span> Select Colleges
              </h3>
              <div className="flex gap-2">
                <button onClick={selectAllColleges} className="btn btn-ghost text-xs">
                  Select All
                </button>
                <button onClick={deselectAllColleges} className="btn btn-ghost text-xs">
                  Deselect All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-lg"></div>
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <p className="text-4xl mb-3">🏛️</p>
                <p>No colleges registered</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {colleges.map((college) => (
                  <button
                    key={college.id}
                    onClick={() => toggleCollege(college.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedColleges.includes(college.id)
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedColleges.includes(college.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-[var(--border-default)]'
                        }`}
                      >
                        {selectedColleges.includes(college.id) && (
                          <span className="text-xs text-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{college.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{college.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Distribute Button */}
          <button
            onClick={handleDistribute}
            disabled={!selectedExam || selectedColleges.length === 0 || distributing}
            className="btn btn-primary w-full py-4 text-lg"
          >
            {distributing ? (
              <span className="animate-pulse flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Distributing...
              </span>
            ) : (
              <>
                <span>📧</span>
                Distribute to {selectedColleges.length} College
                {selectedColleges.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {/* Distribution Log */}
          {distributionLog.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📋</span> Distribution Log
              </h3>
              <div className="space-y-2">
                {distributionLog.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.status === 'sent' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <span>{log.collegeName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge ${
                          log.status === 'sent' ? 'badge-success' : 'badge-error'
                        }`}
                      >
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

        {/* Sidebar - Distribution History */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Distribution Stats
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center">
                <p className="text-3xl font-bold text-gradient">{distributedExams.length}</p>
                <p className="text-sm text-[var(--text-muted)]">Exams Distributed</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                  <p className="text-xl font-bold">{colleges.length}</p>
                  <p className="text-xs text-[var(--text-muted)]">Colleges</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-center">
                  <p className="text-xl font-bold">{draftExams.length}</p>
                  <p className="text-xs text-[var(--text-muted)]">Pending</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📜</span> Recent Distributions
            </h3>
            {distributedExams.length === 0 ? (
              <p className="text-center py-6 text-[var(--text-muted)]">
                No distributions yet
              </p>
            ) : (
              <div className="space-y-3">
                {distributedExams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="font-medium truncate">{exam.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        {exam.distributions.length} college
                        {exam.distributions.length !== 1 ? 's' : ''}
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

