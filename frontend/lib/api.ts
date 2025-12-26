const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blank';
  complexity: 'easy' | 'medium' | 'hard' | 'expert';
  weight: number;
  subject: string;
  topic: string;
  tags: string[];
  options?: { id: string; text: string; isCorrect: boolean }[];
  answer: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  version: number;
}

export interface ExamSection {
  id: string;
  title: string;
  instructions?: string;
  questionIds: string[];
  totalMarks: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description?: string;
  instructions: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  sections: ExamSection[];
  status: 'draft' | 'published' | 'distributed' | 'modified' | 'completed';
  createdAt: string;
  updatedAt: string;
  distributions: {
    collegeId: string;
    collegeName: string;
    email: string;
    distributedAt: string;
  }[];
  modifications: {
    id: string;
    timestamp: string;
    questionId: string;
    changeType: 'add' | 'remove' | 'update';
    description: string;
  }[];
  version: number;
}

export interface College {
  id: string;
  name: string;
  email: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  isActive: boolean;
}

export interface QuestionStatistics {
  total: number;
  byComplexity: Record<string, number>;
  byType: Record<string, number>;
  bySubject: Record<string, number>;
}

// Questions API
export const questionsApi = {
  getAll: async (filters?: Record<string, string>): Promise<Question[]> => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/questions?${params}`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  getOne: async (id: string): Promise<Question> => {
    const res = await fetch(`${API_BASE}/questions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch question');
    return res.json();
  },

  create: async (data: Partial<Question>): Promise<Question> => {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create question');
    return res.json();
  },

  update: async (id: string, data: Partial<Question>): Promise<Question> => {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update question');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete question');
  },

  getStatistics: async (): Promise<QuestionStatistics> => {
    const res = await fetch(`${API_BASE}/questions/statistics`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  generateSelection: async (criteria: {
    count: number;
    subject?: string;
    complexity?: string[];
    types?: string[];
    totalWeight?: number;
  }): Promise<Question[]> => {
    const res = await fetch(`${API_BASE}/questions/generate-selection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
    });
    if (!res.ok) throw new Error('Failed to generate selection');
    return res.json();
  },
};

// Exams API
export const examsApi = {
  getAll: async (): Promise<Exam[]> => {
    const res = await fetch(`${API_BASE}/exams`);
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  getOne: async (id: string): Promise<Exam> => {
    const res = await fetch(`${API_BASE}/exams/${id}`);
    if (!res.ok) throw new Error('Failed to fetch exam');
    return res.json();
  },

  getFull: async (id: string): Promise<{ exam: Exam; sections: { section: ExamSection; questions: Question[] }[] }> => {
    const res = await fetch(`${API_BASE}/exams/${id}/full`);
    if (!res.ok) throw new Error('Failed to fetch full exam');
    return res.json();
  },

  create: async (data: Partial<Exam>): Promise<Exam> => {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create exam');
    return res.json();
  },

  generate: async (data: {
    title: string;
    subject: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    criteria: {
      easyCount: number;
      mediumCount: number;
      hardCount: number;
      expertCount: number;
    };
  }): Promise<Exam> => {
    const res = await fetch(`${API_BASE}/exams/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate exam');
    return res.json();
  },

  update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update exam');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete exam');
  },

  getPdfContent: async (id: string, includeAnswers: boolean = false): Promise<{ html: string; exam: Exam; questions: Question[] }> => {
    const res = await fetch(`${API_BASE}/exams/${id}/pdf-content?includeAnswers=${includeAnswers}`);
    if (!res.ok) throw new Error('Failed to get PDF content');
    return res.json();
  },

  distribute: async (examId: string, collegeIds: string[]): Promise<Exam> => {
    const res = await fetch(`${API_BASE}/exams/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, collegeIds }),
    });
    if (!res.ok) throw new Error('Failed to distribute exam');
    return res.json();
  },

  modify: async (examId: string, modifications: { questionId: string; changeType: string; description: string }[]): Promise<{
    exam: Exam;
    syncData: {
      filter: { bitArray: number[]; size: number; hashCount: number };
      modificationsToSync: { id: string; questionId: string; changeType: string; description: string }[];
      affectedColleges: string[];
    };
  }> => {
    const res = await fetch(`${API_BASE}/exams/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, modifications }),
    });
    if (!res.ok) throw new Error('Failed to modify exam');
    return res.json();
  },
};

// Colleges API
export const collegesApi = {
  getAll: async (): Promise<College[]> => {
    const res = await fetch(`${API_BASE}/exams/colleges/all`);
    if (!res.ok) throw new Error('Failed to fetch colleges');
    return res.json();
  },

  create: async (data: Partial<College>): Promise<College> => {
    const res = await fetch(`${API_BASE}/exams/colleges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create college');
    return res.json();
  },
};

// Email API
export const emailApi = {
  distribute: async (examTitle: string, pdfHtml: string, colleges: { id: string; name: string; email: string }[]) => {
    const res = await fetch(`${API_BASE}/email/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examTitle, pdfHtml, colleges }),
    });
    if (!res.ok) throw new Error('Failed to send emails');
    return res.json();
  },

  notifyModification: async (
    examTitle: string,
    modifications: { changeType: string; description: string }[],
    colleges: { id: string; name: string; email: string }[]
  ) => {
    const res = await fetch(`${API_BASE}/email/notify-modification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examTitle, modifications, colleges }),
    });
    if (!res.ok) throw new Error('Failed to send modification notifications');
    return res.json();
  },
};

