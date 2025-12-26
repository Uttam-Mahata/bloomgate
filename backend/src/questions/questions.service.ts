import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Question,
  QuestionComplexity,
  QuestionType,
} from './entities/question.entity';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  FilterQuestionsDto,
} from './dto/create-question.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionsService {
  private questions: Map<string, Question> = new Map();
  private modificationLog: { id: string; timestamp: Date; action: string }[] =
    [];

  constructor() {
    // Initialize with some sample questions
    this.seedSampleQuestions();
  }

  private seedSampleQuestions() {
    const sampleQuestions: CreateQuestionDto[] = [
      {
        text: 'What is the time complexity of binary search?',
        type: QuestionType.MULTIPLE_CHOICE,
        complexity: QuestionComplexity.MEDIUM,
        weight: 2,
        subject: 'Computer Science',
        topic: 'Algorithms',
        tags: ['search', 'complexity', 'binary-search'],
        options: [
          { id: '1', text: 'O(n)', isCorrect: false },
          { id: '2', text: 'O(log n)', isCorrect: true },
          { id: '3', text: 'O(n²)', isCorrect: false },
          { id: '4', text: 'O(1)', isCorrect: false },
        ],
        answer: 'O(log n)',
        explanation:
          'Binary search divides the search space in half each iteration, resulting in logarithmic time complexity.',
      },
      {
        text: 'Explain the concept of a Bloom Filter and its applications.',
        type: QuestionType.LONG_ANSWER,
        complexity: QuestionComplexity.HARD,
        weight: 10,
        subject: 'Computer Science',
        topic: 'Data Structures',
        tags: ['bloom-filter', 'probabilistic', 'data-structures'],
        answer:
          'A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. It may have false positives but never false negatives.',
        explanation:
          'Applications include spell checkers, cache filtering, and distributed systems for membership queries.',
      },
      {
        text: 'What is the difference between TCP and UDP?',
        type: QuestionType.SHORT_ANSWER,
        complexity: QuestionComplexity.EASY,
        weight: 3,
        subject: 'Computer Science',
        topic: 'Networking',
        tags: ['networking', 'protocols', 'tcp', 'udp'],
        answer:
          'TCP is connection-oriented and reliable, while UDP is connectionless and faster but unreliable.',
      },
      {
        text: 'A hash table has O(1) average time complexity for search operations.',
        type: QuestionType.TRUE_FALSE,
        complexity: QuestionComplexity.EASY,
        weight: 1,
        subject: 'Computer Science',
        topic: 'Data Structures',
        tags: ['hash-table', 'complexity'],
        options: [
          { id: '1', text: 'True', isCorrect: true },
          { id: '2', text: 'False', isCorrect: false },
        ],
        answer: 'True',
      },
      {
        text: 'The process of converting data into a fixed-size value is called ________.',
        type: QuestionType.FILL_BLANK,
        complexity: QuestionComplexity.MEDIUM,
        weight: 2,
        subject: 'Computer Science',
        topic: 'Cryptography',
        tags: ['hashing', 'cryptography'],
        answer: 'hashing',
      },
    ];

    sampleQuestions.forEach((q) => this.create(q));
  }

  create(createQuestionDto: CreateQuestionDto): Question {
    const question = new Question({
      ...createQuestionDto,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      isActive: true,
      version: 1,
    });

    this.questions.set(question.id, question);
    this.logModification(question.id, 'create');

    return question;
  }

  findAll(filters?: FilterQuestionsDto): Question[] {
    let questions = Array.from(this.questions.values());

    if (filters) {
      if (filters.subject) {
        questions = questions.filter((q) =>
          q.subject.toLowerCase().includes(filters.subject!.toLowerCase()),
        );
      }
      if (filters.topic) {
        questions = questions.filter((q) =>
          q.topic.toLowerCase().includes(filters.topic!.toLowerCase()),
        );
      }
      if (filters.complexity) {
        questions = questions.filter(
          (q) => q.complexity === filters.complexity,
        );
      }
      if (filters.type) {
        questions = questions.filter((q) => q.type === filters.type);
      }
      if (filters.tags && filters.tags.length > 0) {
        questions = questions.filter((q) =>
          filters.tags!.some((tag) => q.tags.includes(tag)),
        );
      }
      if (filters.minWeight !== undefined) {
        questions = questions.filter((q) => q.weight >= filters.minWeight!);
      }
      if (filters.maxWeight !== undefined) {
        questions = questions.filter((q) => q.weight <= filters.maxWeight!);
      }
      if (filters.isActive !== undefined) {
        questions = questions.filter((q) => q.isActive === filters.isActive);
      }
    }

    return questions;
  }

  findOne(id: string): Question {
    const question = this.questions.get(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  update(id: string, updateQuestionDto: UpdateQuestionDto): Question {
    const question = this.findOne(id);

    const updatedQuestion = new Question({
      ...question,
      ...updateQuestionDto,
      updatedAt: new Date(),
      version: question.version + 1,
    });

    this.questions.set(id, updatedQuestion);
    this.logModification(id, 'update');

    return updatedQuestion;
  }

  remove(id: string): void {
    if (!this.questions.has(id)) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    this.questions.delete(id);
    this.logModification(id, 'delete');
  }

  bulkImport(questions: CreateQuestionDto[]): Question[] {
    return questions.map((q) => this.create(q));
  }

  /**
   * Get questions by IDs
   */
  getByIds(ids: string[]): Question[] {
    return ids
      .map((id) => this.questions.get(id))
      .filter((q): q is Question => q !== undefined);
  }

  /**
   * Get all modification logs for bloom filter sync
   */
  getModificationLog(
    since?: Date,
  ): { id: string; timestamp: Date; action: string }[] {
    if (since) {
      return this.modificationLog.filter((log) => log.timestamp >= since);
    }
    return this.modificationLog;
  }

  /**
   * Get modified question IDs for bloom filter
   */
  getModifiedIds(since?: Date): string[] {
    return this.getModificationLog(since).map((log) => log.id);
  }

  private logModification(id: string, action: string): void {
    this.modificationLog.push({ id, timestamp: new Date(), action });
  }

  /**
   * Get statistics about questions
   */
  getStatistics(): {
    total: number;
    byComplexity: Record<QuestionComplexity, number>;
    byType: Record<QuestionType, number>;
    bySubject: Record<string, number>;
  } {
    const questions = Array.from(this.questions.values());
    const byComplexity = {} as Record<QuestionComplexity, number>;
    const byType = {} as Record<QuestionType, number>;
    const bySubject: Record<string, number> = {};

    // Initialize
    Object.values(QuestionComplexity).forEach((c) => (byComplexity[c] = 0));
    Object.values(QuestionType).forEach((t) => (byType[t] = 0));

    questions.forEach((q) => {
      byComplexity[q.complexity]++;
      byType[q.type]++;
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });

    return {
      total: questions.length,
      byComplexity,
      byType,
      bySubject,
    };
  }

  /**
   * Generate random selection of questions based on criteria
   */
  generateRandomSelection(criteria: {
    count: number;
    subject?: string;
    complexity?: QuestionComplexity[];
    types?: QuestionType[];
    totalWeight?: number;
  }): Question[] {
    let pool = this.findAll({ subject: criteria.subject, isActive: true });

    if (criteria.complexity && criteria.complexity.length > 0) {
      pool = pool.filter((q) => criteria.complexity!.includes(q.complexity));
    }

    if (criteria.types && criteria.types.length > 0) {
      pool = pool.filter((q) => criteria.types!.includes(q.type));
    }

    // Shuffle and select
    const shuffled = pool.sort(() => Math.random() - 0.5);

    if (criteria.totalWeight) {
      // Select questions that fit within total weight
      const selected: Question[] = [];
      let currentWeight = 0;

      for (const q of shuffled) {
        if (currentWeight + q.weight <= criteria.totalWeight) {
          selected.push(q);
          currentWeight += q.weight;
        }
        if (selected.length >= criteria.count) break;
      }

      return selected;
    }

    return shuffled.slice(0, criteria.count);
  }
}
