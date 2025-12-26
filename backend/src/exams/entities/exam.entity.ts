import { v4 as uuidv4 } from 'uuid';
import { Question } from '../../questions/entities/question.entity';

export enum ExamStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DISTRIBUTED = 'distributed',
  MODIFIED = 'modified',
  COMPLETED = 'completed',
}

export interface ExamSection {
  id: string;
  title: string;
  instructions?: string;
  questionIds: string[];
  totalMarks: number;
}

export interface ExamDistribution {
  collegeId: string;
  collegeName: string;
  email: string;
  distributedAt: Date;
  syncedAt?: Date;
  bloomFilterHash?: string;
}

export interface ExamModification {
  id: string;
  timestamp: Date;
  questionId: string;
  changeType: 'add' | 'remove' | 'update';
  description: string;
  syncedToColleges: string[];
}

export class Exam {
  id: string;
  title: string;
  subject: string;
  description?: string;
  instructions: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  sections: ExamSection[];
  status: ExamStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  publishedAt?: Date;
  distributions: ExamDistribution[];
  modifications: ExamModification[];
  version: number;
  pdfUrl?: string;
  answerKeyPdfUrl?: string;

  constructor(partial: Partial<Exam>) {
    this.id = partial.id || uuidv4();
    this.title = partial.title || '';
    this.subject = partial.subject || '';
    this.description = partial.description;
    this.instructions = partial.instructions || '';
    this.duration = partial.duration || 60;
    this.totalMarks = partial.totalMarks || 0;
    this.passingMarks = partial.passingMarks || 0;
    this.sections = partial.sections || [];
    this.status = partial.status || ExamStatus.DRAFT;
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
    this.createdBy = partial.createdBy || 'admin';
    this.publishedAt = partial.publishedAt;
    this.distributions = partial.distributions || [];
    this.modifications = partial.modifications || [];
    this.version = partial.version || 1;
    this.pdfUrl = partial.pdfUrl;
    this.answerKeyPdfUrl = partial.answerKeyPdfUrl;
  }

  /**
   * Get all question IDs across all sections
   */
  getAllQuestionIds(): string[] {
    return this.sections.flatMap((s) => s.questionIds);
  }

  /**
   * Generate bloom key for sync
   */
  getBloomKey(): string {
    return `exam:${this.id}:v${this.version}`;
  }

  /**
   * Get modification IDs for bloom filter
   */
  getModificationIds(): string[] {
    return this.modifications.map((m) => m.id);
  }
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
