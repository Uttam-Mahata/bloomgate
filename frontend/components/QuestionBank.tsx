'use client';

import { useEffect, useState } from 'react';
import { questionsApi, Question } from '@/lib/api';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  FileText,
  CheckCircle,
  List,
  HelpCircle,
  Tag,
  X,
} from 'lucide-react';

interface QuestionFormData {
  text: string;
  type: Question['type'];
  complexity: Question['complexity'];
  weight: number;
  subject: string;
  topic: string;
  tags: string;
  answer: string;
  explanation: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

const initialFormData: QuestionFormData = {
  text: '',
  type: 'short_answer',
  complexity: 'medium',
  weight: 2,
  subject: '',
  topic: '',
  tags: '',
  answer: '',
  explanation: '',
  options: [
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
    { id: '4', text: '', isCorrect: false },
  ],
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const [filters, setFilters] = useState({
    complexity: '',
    type: '',
    subject: '',
  });

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const filterParams: Record<string, string> = {};
      if (filters.complexity) filterParams.complexity = filters.complexity;
      if (filters.type) filterParams.type = filters.type;
      if (filters.subject) filterParams.subject = filters.subject;
      
      const data = await questionsApi.getAll(filterParams);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionData = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        options: formData.type === 'multiple_choice' || formData.type === 'true_false' 
          ? formData.options 
          : undefined,
      };

      if (editingQuestion) {
        await questionsApi.update(editingQuestion.id, questionData);
      } else {
        await questionsApi.create(questionData);
      }

      setShowModal(false);
      setEditingQuestion(null);
      setFormData(initialFormData);
      loadQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      type: question.type,
      complexity: question.complexity,
      weight: question.weight,
      subject: question.subject,
      topic: question.topic,
      tags: question.tags.join(', '),
      answer: question.answer,
      explanation: question.explanation || '',
      options: question.options || initialFormData.options,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionsApi.delete(id);
      loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const complexityColors: Record<string, string> = {
    easy: 'complexity-easy',
    medium: 'complexity-medium',
    hard: 'complexity-hard',
    expert: 'complexity-expert',
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return <List size={16} />;
      case 'short_answer': return <FileText size={16} />;
      case 'long_answer': return <FileText size={16} />;
      case 'true_false': return <CheckCircle size={16} />;
      case 'fill_blank': return <HelpCircle size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Manage your question repository with weights and complexity levels
          </p>
        </div>
        <button
          onClick={() => {
            setEditingQuestion(null);
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md text-sm text-[var(--text-muted)]">
          <Filter size={16} />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-sm">Complexity</label>
            <select
              className="select"
              value={filters.complexity}
              onChange={(e) => setFilters({ ...filters, complexity: e.target.value })}
            >
              <option value="">All Complexities</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-sm">Type</label>
            <select
              className="select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
              <option value="long_answer">Long Answer</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in the Blank</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-sm">Subject</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '44px' }}
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-md">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-5 w-3/4 mb-3"></div>
                <div className="skeleton h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-12">
            <HelpCircle size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
            <p className="text-lg font-medium">No questions found</p>
            <p className="text-[var(--text-muted)] mt-1 text-sm">
              Add your first question to get started
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="icon-wrapper icon-wrapper-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                      {getTypeIcon(question.type)}
                    </span>
                    <span className={`badge ${complexityColors[question.complexity]}`}>
                      {question.complexity}
                    </span>
                    <span className="badge badge-info">{question.weight} marks</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {question.subject} • {question.topic}
                    </span>
                  </div>
                  <p className="text-[var(--text-primary)] text-sm leading-relaxed">{question.text}</p>
                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(question)}
                    className="btn btn-ghost btn-icon"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="btn btn-ghost btn-icon text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Question Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
                  Question Text *
                </label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  placeholder="Enter your question..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-sm">Type *</label>
                  <select
                    className="select"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Question['type'] })
                    }
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="long_answer">Long Answer</option>
                    <option value="true_false">True/False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-sm">
                    Complexity *
                  </label>
                  <select
                    className="select"
                    value={formData.complexity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        complexity: e.target.value as Question['complexity'],
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-sm">
                    Weight (marks) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })
                    }
                    min="1"
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
                    required
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-sm">Topic</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Algorithms"
                  />
                </div>
              </div>

              {(formData.type === 'multiple_choice' || formData.type === 'true_false') && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-sm">Options</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index].isCorrect = e.target.checked;
                            setFormData({ ...formData, options: newOptions });
                          }}
                        />
                        <input
                          type="text"
                          className="input flex-1"
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index].text = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Answer *</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  placeholder="Enter the correct answer..."
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
                  Explanation (optional)
                </label>
                <textarea
                  className="input min-h-[60px]"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain the answer..."
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., algorithms, search, complexity"
                />
              </div>

              <div className="flex gap-md pt-md">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
