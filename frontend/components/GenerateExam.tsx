'use client';

import { useState } from 'react';
import { examsApi, Exam } from '@/lib/api';
import {
  Sparkles,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  Award,
  Layers,
  Loader2,
} from 'lucide-react';

interface GenerateExamProps {
  onGenerated: (exam: Exam) => void;
}

export default function GenerateExam({ onGenerated }: GenerateExamProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    duration: 120,
    totalMarks: 100,
    passingMarks: 40,
    easyCount: 5,
    mediumCount: 10,
    hardCount: 5,
    expertCount: 2,
  });
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<Exam | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const exam = await examsApi.generate({
        title: formData.title,
        subject: formData.subject,
        duration: formData.duration,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        criteria: {
          easyCount: formData.easyCount,
          mediumCount: formData.mediumCount,
          hardCount: formData.hardCount,
          expertCount: formData.expertCount,
        },
      });

      setGeneratedExam(exam);
      onGenerated(exam);
    } catch (error) {
      console.error('Failed to generate exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions =
    formData.easyCount + formData.mediumCount + formData.hardCount + formData.expertCount;

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="mb-md">
        <h1 className="text-2xl font-bold flex items-center gap-sm">
          <span className="icon-wrapper icon-wrapper-md bg-[var(--accent-glow)] text-[var(--accent-primary)] animate-float">
            <Sparkles size={20} />
          </span>
          Smart Exam Generator
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Automatically generate exam papers based on complexity distribution
        </p>
      </div>

      <div className="grid-2-cols">
        {/* Configuration Form */}
        <div className="card">
          <h3 className="text-base font-semibold mb-md flex items-center gap-sm">
            <Settings size={18} className="text-[var(--accent-primary)]" />
            Configuration
          </h3>

          <form onSubmit={handleGenerate} className="space-y-md">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-sm">Exam Title *</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Data Structures Final Exam"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-sm">Subject *</label>
              <input
                type="text"
                className="input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
                  Duration (min)
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })
                  }
                  min="30"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Total Marks</label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 100 })
                  }
                  min="10"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Passing</label>
                <input
                  type="number"
                  className="input"
                  value={formData.passingMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 40 })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="pt-md border-t border-[var(--border-subtle)]">
              <h4 className="font-medium text-sm mb-md">Question Distribution by Complexity</h4>

              <div className="space-y-md">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      Easy Questions
                    </span>
                    <span className="font-mono">{formData.easyCount}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-green-500"
                    value={formData.easyCount}
                    onChange={(e) =>
                      setFormData({ ...formData, easyCount: parseInt(e.target.value) })
                    }
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      Medium Questions
                    </span>
                    <span className="font-mono">{formData.mediumCount}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-amber-500"
                    value={formData.mediumCount}
                    onChange={(e) =>
                      setFormData({ ...formData, mediumCount: parseInt(e.target.value) })
                    }
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      Hard Questions
                    </span>
                    <span className="font-mono">{formData.hardCount}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-red-500"
                    value={formData.hardCount}
                    onChange={(e) =>
                      setFormData({ ...formData, hardCount: parseInt(e.target.value) })
                    }
                    min="0"
                    max="15"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                      Expert Questions
                    </span>
                    <span className="font-mono">{formData.expertCount}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-purple-500"
                    value={formData.expertCount}
                    onChange={(e) =>
                      setFormData({ ...formData, expertCount: parseInt(e.target.value) })
                    }
                    min="0"
                    max="10"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || totalQuestions === 0}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </span>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Exam Paper
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="card">
          <h3 className="text-base font-semibold mb-md flex items-center gap-sm">
            <Eye size={18} className="text-[var(--accent-primary)]" />
            Preview
          </h3>

          <div className="space-y-lg">
            {/* Summary */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-gradient">{totalQuestions}</p>
                <p className="text-sm text-[var(--text-muted)]">Total Questions</p>
              </div>

              <div className="grid grid-cols-2 gap-md text-center">
                <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
                  <div className="flex items-center justify-center gap-1">
                    <Clock size={14} className="text-[var(--text-muted)]" />
                    <span className="text-lg font-semibold">{formData.duration}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">minutes</p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
                  <div className="flex items-center justify-center gap-1">
                    <Award size={14} className="text-[var(--text-muted)]" />
                    <span className="text-lg font-semibold">{formData.totalMarks}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">marks</p>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            {totalQuestions > 0 && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-2">Complexity Distribution</p>
                <div className="h-6 rounded-full overflow-hidden flex bg-[var(--bg-tertiary)]">
                  {formData.easyCount > 0 && (
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(formData.easyCount / totalQuestions) * 100}%` }}
                    ></div>
                  )}
                  {formData.mediumCount > 0 && (
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${(formData.mediumCount / totalQuestions) * 100}%` }}
                    ></div>
                  )}
                  {formData.hardCount > 0 && (
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${(formData.hardCount / totalQuestions) * 100}%` }}
                    ></div>
                  )}
                  {formData.expertCount > 0 && (
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${(formData.expertCount / totalQuestions) * 100}%` }}
                    ></div>
                  )}
                </div>
                <div className="flex flex-wrap justify-between mt-2 gap-2 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Easy
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Hard
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Expert
                  </span>
                </div>
              </div>
            )}

            {/* Generated Exam Result */}
            {generatedExam && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={24} className="text-green-400" />
                  <div>
                    <p className="font-semibold text-green-400">Exam Generated!</p>
                    <p className="text-sm text-[var(--text-muted)]">{generatedExam.title}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <p className="font-semibold">{generatedExam.sections.length}</p>
                    <p className="text-xs text-[var(--text-muted)]">Sections</p>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <p className="font-semibold">{generatedExam.totalMarks}</p>
                    <p className="text-xs text-[var(--text-muted)]">Marks</p>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <p className="font-semibold">v{generatedExam.version}</p>
                    <p className="text-xs text-[var(--text-muted)]">Version</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sections Preview */}
            {totalQuestions > 0 && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-2">Expected Sections</p>
                <div className="space-y-2">
                  {formData.easyCount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Section A - Easy
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formData.easyCount} questions
                      </span>
                    </div>
                  )}
                  {formData.mediumCount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Section B - Medium
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formData.mediumCount} questions
                      </span>
                    </div>
                  )}
                  {formData.hardCount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Section C - Hard
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formData.hardCount} questions
                      </span>
                    </div>
                  )}
                  {formData.expertCount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Section D - Expert
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formData.expertCount} questions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
