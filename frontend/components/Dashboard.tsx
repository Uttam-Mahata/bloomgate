'use client';

import { useEffect, useState } from 'react';
import { questionsApi, examsApi, collegesApi, QuestionStatistics, Exam, College } from '@/lib/api';
import {
  HelpCircle,
  FileText,
  Building2,
  Send,
  RefreshCw,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  BarChart3,
  List,
} from 'lucide-react';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      icon: HelpCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Exam Papers',
      value: exams.length,
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Colleges',
      value: colleges.length,
      icon: Building2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Distributed',
      value: exams.filter((e) => e.status === 'distributed' || e.status === 'modified').length,
      icon: Send,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const complexityData = stats?.byComplexity || {};
  const totalComplexity = Object.values(complexityData).reduce((a, b) => a + b, 0);

  const typeIcons: Record<string, React.ReactNode> = {
    multiple_choice: <List size={16} />,
    short_answer: <FileText size={16} />,
    long_answer: <FileText size={16} />,
    true_false: <CheckCircle size={16} />,
    fill_blank: <HelpCircle size={16} />,
  };

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome to <span className="text-gradient">BloomGate</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
            Smart Exam Paper Generator with BloomJoin Technology
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-[var(--text-muted)]">Last updated</p>
          <p className="text-sm text-[var(--text-secondary)]">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="stat-card">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
                <div className={`icon-wrapper icon-wrapper-md ${stat.bgColor} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Question Complexity Distribution */}
        <div className="card lg:col-span-2 animate-fade-in stagger-2">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--accent-primary)]" />
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
                      {count} ({percentage.toFixed(0)}%)
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
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ marginBottom: '16px' }}>
            <List size={18} className="text-[var(--accent-primary)]" />
            Question Types
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(stats?.byType || {}).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)]"
                style={{ padding: '12px 14px' }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <span className="icon-wrapper icon-wrapper-sm bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                    {typeIcons[type] || <HelpCircle size={16} />}
                  </span>
                  <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                </div>
                <span className="badge badge-info">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="card animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText size={18} className="text-[var(--accent-primary)]" />
            Recent Exam Papers
          </h3>
          <span className="text-sm text-[var(--text-muted)]">{exams.length} total</span>
        </div>
        {exams.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>No exam papers created yet</p>
            <p className="text-sm mt-1">Generate your first exam to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="table min-w-[600px]">
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
                    <td className="flex items-center gap-1">
                      <Clock size={14} className="text-[var(--text-muted)]" />
                      {exam.duration} min
                    </td>
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
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="icon-wrapper icon-wrapper-lg bg-gradient-to-br from-[var(--accent-primary)] to-amber-600 text-black animate-float flex-shrink-0">
            <RefreshCw size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">BloomJoin Technology</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              BloomGate uses the BloomJoin algorithm to efficiently synchronize exam modifications
              across distributed college sites. When you modify a distributed exam, only the
              changed questions are synced using bloom filters, minimizing network cost.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap size={14} className="text-green-400" />
                <span className="text-[var(--text-muted)]">Efficient sync</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-[var(--text-muted)]">Low bandwidth</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw size={14} className="text-purple-400" />
                <span className="text-[var(--text-muted)]">Real-time updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
