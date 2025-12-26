'use client';

import { useEffect, useState } from 'react';
import { questionsApi, examsApi, collegesApi, QuestionStatistics, Exam, College } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<QuestionStatistics | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, examsData, collegesData] = await Promise.all([
        questionsApi.getStatistics(),
        examsApi.getAll(),
        collegesApi.getAll(),
      ]);
      setStats(statsData);
      setExams(examsData);
      setColleges(collegesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-24 mb-4"></div>
              <div className="skeleton h-8 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Questions',
      value: stats?.total || 0,
      icon: '❓',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Exam Papers',
      value: exams.length,
      icon: '📝',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'rgba(168, 85, 247, 0.1)',
    },
    {
      label: 'Colleges',
      value: colleges.length,
      icon: '🏛️',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Distributed',
      value: exams.filter((e) => e.status === 'distributed' || e.status === 'modified').length,
      icon: '📤',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  const complexityData = stats?.byComplexity || {};
  const totalComplexity = Object.values(complexityData).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome to <span className="text-gradient">BloomGate</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Smart Exam Paper Generator with BloomJoin Technology
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-muted)]">Last updated</p>
          <p className="text-[var(--text-secondary)]">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="card card-interactive animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}
                style={{ background: stat.bgColor }}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color}`}
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Complexity Distribution */}
        <div className="card lg:col-span-2 animate-fade-in stagger-2">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Question Complexity Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(complexityData).map(([complexity, count]) => {
              const percentage = totalComplexity > 0 ? (count / totalComplexity) * 100 : 0;
              const colors: Record<string, string> = {
                easy: 'bg-green-500',
                medium: 'bg-amber-500',
                hard: 'bg-red-500',
                expert: 'bg-purple-500',
              };
              return (
                <div key={complexity} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{complexity}</span>
                    <span className="text-[var(--text-muted)]">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${colors[complexity] || 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Types */}
        <div className="card animate-fade-in stagger-3">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Question Types
          </h3>
          <div className="space-y-3">
            {Object.entries(stats?.byType || {}).map(([type, count]) => {
              const icons: Record<string, string> = {
                multiple_choice: '🔘',
                short_answer: '✏️',
                long_answer: '📝',
                true_false: '✓✗',
                fill_blank: '___',
              };
              return (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-sm">
                      {icons[type] || '❓'}
                    </span>
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <span className="badge badge-info">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="card animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">📝</span>
            Recent Exam Papers
          </h3>
          <span className="text-sm text-[var(--text-muted)]">{exams.length} total</span>
        </div>
        {exams.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <p className="text-4xl mb-4">📄</p>
            <p>No exam papers created yet</p>
            <p className="text-sm mt-1">Generate your first exam to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Marks</th>
                  <th>Status</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                {exams.slice(0, 5).map((exam) => (
                  <tr key={exam.id}>
                    <td className="font-medium">{exam.title}</td>
                    <td className="text-[var(--text-secondary)]">{exam.subject}</td>
                    <td>{exam.duration} min</td>
                    <td>{exam.totalMarks}</td>
                    <td>
                      <span
                        className={`badge ${
                          exam.status === 'draft'
                            ? 'badge-warning'
                            : exam.status === 'distributed'
                            ? 'badge-success'
                            : exam.status === 'modified'
                            ? 'badge-info'
                            : 'badge-info'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="font-mono text-sm">v{exam.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BloomJoin Info */}
      <div className="card glass animate-fade-in stagger-5">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-amber-600 flex items-center justify-center text-3xl shadow-lg animate-float">
            🔄
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">BloomJoin Technology</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              BloomGate uses the BloomJoin algorithm to efficiently synchronize exam modifications
              across distributed college sites. When you modify a distributed exam, only the
              changed questions are synced using bloom filters, minimizing network cost and
              ensuring all colleges receive updates in real-time.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-[var(--text-muted)]">Efficient sync</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[var(--text-muted)]">Low bandwidth</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-[var(--text-muted)]">Real-time updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

