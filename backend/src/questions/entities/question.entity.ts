import { v4 as uuidv4 } from 'uuid';

export enum QuestionComplexity {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export class Question {
  id: string;
  text: string;
  type: QuestionType;
  complexity: QuestionComplexity;
  weight: number; // marks/points for this question
  subject: string;
  topic: string;
  tags: string[];
  options?: QuestionOption[]; // for MCQ, True/False
  answer: string; // correct answer text
  explanation?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  version: number;

  constructor(partial: Partial<Question>) {
    this.id = partial.id || uuidv4();
    this.text = partial.text || '';
    this.type = partial.type || QuestionType.SHORT_ANSWER;
    this.complexity = partial.complexity || QuestionComplexity.MEDIUM;
    this.weight = partial.weight || 1;
    this.subject = partial.subject || '';
    this.topic = partial.topic || '';
    this.tags = partial.tags || [];
    this.options = partial.options;
    this.answer = partial.answer || '';
    this.explanation = partial.explanation;
    this.imageUrl = partial.imageUrl;
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
    this.createdBy = partial.createdBy || 'admin';
    this.isActive = partial.isActive !== undefined ? partial.isActive : true;
    this.version = partial.version || 1;
  }

  /**
   * Generate a unique hash for bloom filter
   */
  getBloomKey(): string {
    return `${this.id}:${this.version}`;
  }
}

export interface QuestionBank {
  id: string;
  name: string;
  subject: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
