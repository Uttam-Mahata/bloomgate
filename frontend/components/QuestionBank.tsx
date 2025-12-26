'use client';

import { useEffect, useState } from 'react';
import { questionsApi, Question } from '@/lib/api';

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

  const typeIcons: Record<string, string> = {
    multiple_choice: '🔘',
    short_answer: '✏️',
    long_answer: '📝',
    true_false: '✓✗',
    fill_blank: '___',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-[var(--text-secondary)] mt-1">
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
          <span>+</span> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[var(--text-muted)] mb-2">Complexity</label>
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[var(--text-muted)] mb-2">Type</label>
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[var(--text-muted)] mb-2">Subject</label>
            <input
              type="text"
              className="input"
              placeholder="Filter by subject..."
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-6 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg font-medium">No questions found</p>
            <p className="text-[var(--text-muted)] mt-1">
              Add your first question to get started
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{typeIcons[question.type]}</span>
                    <span className={`badge ${complexityColors[question.complexity]}`}>
                      {question.complexity}
                    </span>
                    <span className="badge badge-info">{question.weight} marks</span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {question.subject} • {question.topic}
                    </span>
                  </div>
                  <p className="text-[var(--text-primary)] leading-relaxed">{question.text}</p>
                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="btn btn-ghost text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="btn btn-ghost text-sm text-red-400"
                  >
                    🗑️
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
            <h2 className="text-xl font-bold mb-6">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Type *</label>
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Subject *</label>
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Topic</label>
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
                  <label className="block text-sm text-[var(--text-muted)] mb-2">Options</label>
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
                <label className="block text-sm text-[var(--text-muted)] mb-2">Answer *</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  placeholder="Enter the correct answer..."
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
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
                <label className="block text-sm text-[var(--text-muted)] mb-2">
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

              <div className="flex gap-4 pt-4">
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

