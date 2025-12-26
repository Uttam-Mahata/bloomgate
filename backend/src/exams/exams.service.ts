import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Exam,
  ExamStatus,
  ExamSection,
  ExamModification,
  College,
} from './entities/exam.entity';
import {
  CreateExamDto,
  UpdateExamDto,
  GenerateExamDto,
  CreateCollegeDto,
  ModifyDistributedExamDto,
} from './dto/create-exam.dto';
import { QuestionsService } from '../questions/questions.service';
import { BloomFilterService } from '../bloom-filter/bloom-filter.service';
import { QuestionComplexity } from '../questions/entities/question.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExamsService {
  private exams: Map<string, Exam> = new Map();
  private colleges: Map<string, College> = new Map();

  constructor(
    private readonly questionsService: QuestionsService,
    private readonly bloomFilterService: BloomFilterService,
  ) {
    this.seedSampleColleges();
  }

  private seedSampleColleges() {
    const sampleColleges: CreateCollegeDto[] = [
      {
        name: 'MIT College of Engineering',
        email: 'exam@mitcoe.edu',
        contactPerson: 'Dr. John Smith',
      },
      {
        name: 'Stanford University',
        email: 'exams@stanford.edu',
        contactPerson: 'Prof. Jane Doe',
      },
      {
        name: 'IIT Mumbai',
        email: 'exams@iitb.ac.in',
        contactPerson: 'Dr. Ramesh Kumar',
      },
      {
        name: 'Oxford University',
        email: 'exams@ox.ac.uk',
        contactPerson: 'Dr. Elizabeth Brown',
      },
    ];

    sampleColleges.forEach((c) => this.createCollege(c));
  }

  // ============ Exam CRUD ============

  create(createExamDto: CreateExamDto): Exam {
    const exam = new Exam({
      ...createExamDto,
      id: uuidv4(),
      status: ExamStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    this.exams.set(exam.id, exam);
    return exam;
  }

  findAll(): Exam[] {
    return Array.from(this.exams.values());
  }

  findOne(id: string): Exam {
    const exam = this.exams.get(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  update(id: string, updateExamDto: UpdateExamDto): Exam {
    const exam = this.findOne(id);

    const updatedExam = new Exam({
      ...exam,
      ...updateExamDto,
      updatedAt: new Date(),
      version: exam.version + 1,
    });

    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  remove(id: string): void {
    if (!this.exams.has(id)) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    this.exams.delete(id);
  }

  // ============ Exam Generation ============

  generateExam(generateDto: GenerateExamDto): Exam {
    const { title, subject, duration, totalMarks, passingMarks, criteria } =
      generateDto;

    const sections: ExamSection[] = [];
    let currentMarks = 0;

    // Generate sections based on complexity
    if (criteria.easyCount > 0) {
      const easyQuestions = this.questionsService.generateRandomSelection({
        count: criteria.easyCount,
        subject,
        complexity: [QuestionComplexity.EASY],
      });

      const sectionMarks = easyQuestions.reduce((sum, q) => sum + q.weight, 0);
      currentMarks += sectionMarks;

      sections.push({
        id: uuidv4(),
        title: 'Section A - Easy Questions',
        instructions:
          'Answer all questions. Each question carries marks as indicated.',
        questionIds: easyQuestions.map((q) => q.id),
        totalMarks: sectionMarks,
      });
    }

    if (criteria.mediumCount > 0) {
      const mediumQuestions = this.questionsService.generateRandomSelection({
        count: criteria.mediumCount,
        subject,
        complexity: [QuestionComplexity.MEDIUM],
      });

      const sectionMarks = mediumQuestions.reduce(
        (sum, q) => sum + q.weight,
        0,
      );
      currentMarks += sectionMarks;

      sections.push({
        id: uuidv4(),
        title: 'Section B - Medium Questions',
        instructions: 'Answer all questions. Show your work where applicable.',
        questionIds: mediumQuestions.map((q) => q.id),
        totalMarks: sectionMarks,
      });
    }

    if (criteria.hardCount > 0) {
      const hardQuestions = this.questionsService.generateRandomSelection({
        count: criteria.hardCount,
        subject,
        complexity: [QuestionComplexity.HARD],
      });

      const sectionMarks = hardQuestions.reduce((sum, q) => sum + q.weight, 0);
      currentMarks += sectionMarks;

      sections.push({
        id: uuidv4(),
        title: 'Section C - Hard Questions',
        instructions: 'Attempt any questions. Detailed answers are expected.',
        questionIds: hardQuestions.map((q) => q.id),
        totalMarks: sectionMarks,
      });
    }

    if (criteria.expertCount > 0) {
      const expertQuestions = this.questionsService.generateRandomSelection({
        count: criteria.expertCount,
        subject,
        complexity: [QuestionComplexity.EXPERT],
      });

      const sectionMarks = expertQuestions.reduce(
        (sum, q) => sum + q.weight,
        0,
      );
      currentMarks += sectionMarks;

      sections.push({
        id: uuidv4(),
        title: 'Section D - Expert Questions',
        instructions:
          'These are advanced questions. Provide comprehensive answers.',
        questionIds: expertQuestions.map((q) => q.id),
        totalMarks: sectionMarks,
      });
    }

    const exam = new Exam({
      id: uuidv4(),
      title,
      subject,
      duration,
      totalMarks: currentMarks || totalMarks,
      passingMarks,
      sections,
      instructions: `Total Time: ${duration} minutes\nTotal Marks: ${currentMarks}\nPassing Marks: ${passingMarks}\n\nGeneral Instructions:\n1. Read all questions carefully before answering.\n2. Write your answers clearly and legibly.\n3. All questions are compulsory unless stated otherwise.`,
      status: ExamStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    this.exams.set(exam.id, exam);
    return exam;
  }

  // ============ PDF Generation ============

  generatePdfContent(
    examId: string,
    includeAnswers: boolean = false,
  ): {
    html: string;
    exam: Exam;
    questions: any[];
  } {
    const exam = this.findOne(examId);
    const allQuestionIds = exam.getAllQuestionIds();
    const questions = this.questionsService.getByIds(allQuestionIds);

    const questionsMap = new Map(questions.map((q) => [q.id, q]));

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${exam.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=JetBrains+Mono&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Crimson Pro', Georgia, serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px double #2d3748;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1a365d;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .header .subject {
      font-size: 18px;
      color: #4a5568;
      margin-bottom: 5px;
    }
    
    .meta {
      display: flex;
      justify-content: space-between;
      background: #f7fafc;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      border: 1px solid #e2e8f0;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-item .label {
      font-size: 12px;
      text-transform: uppercase;
      color: #718096;
      letter-spacing: 0.5px;
    }
    
    .meta-item .value {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .instructions {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 15px 20px;
      margin-bottom: 30px;
      border-radius: 0 8px 8px 0;
    }
    
    .instructions h3 {
      color: #92400e;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .instructions p {
      white-space: pre-line;
      font-size: 14px;
      color: #78350f;
    }
    
    .section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    
    .section-header {
      background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    
    .section-header h2 {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .section-header .marks {
      font-size: 13px;
      opacity: 0.9;
    }
    
    .section-instructions {
      background: #f1f5f9;
      padding: 10px 20px;
      font-size: 13px;
      color: #475569;
      font-style: italic;
      border-left: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }
    
    .questions {
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    
    .question {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .question:last-child {
      border-bottom: none;
      border-radius: 0 0 8px 8px;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .question-number {
      background: #e2e8f0;
      color: #1a365d;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .question-meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .question-marks {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .question-complexity {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .complexity-easy { background: #d1fae5; color: #065f46; }
    .complexity-medium { background: #fef3c7; color: #92400e; }
    .complexity-hard { background: #fee2e2; color: #991b1b; }
    .complexity-expert { background: #ede9fe; color: #5b21b6; }
    
    .question-text {
      font-size: 16px;
      color: #1a1a1a;
      margin-bottom: 15px;
      line-height: 1.7;
    }
    
    .options {
      margin-left: 20px;
    }
    
    .option {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .option-marker {
      width: 24px;
      height: 24px;
      border: 2px solid #cbd5e1;
      border-radius: 50%;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #64748b;
      flex-shrink: 0;
    }
    
    .option.correct .option-marker {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }
    
    .answer-box {
      margin-top: 15px;
      padding: 15px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
    }
    
    .answer-box h4 {
      color: #166534;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .answer-box p {
      color: #14532d;
      font-size: 14px;
    }
    
    .explanation {
      margin-top: 10px;
      padding: 10px 15px;
      background: #eff6ff;
      border-radius: 6px;
      font-size: 13px;
      color: #1e40af;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    
    .answer-key-header {
      background: #10b981;
      color: white;
      padding: 10px 20px;
      text-align: center;
      margin: 30px 0 20px;
      border-radius: 8px;
    }
    
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
      .question { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${exam.title}</h1>
    <div class="subject">${exam.subject}</div>
    ${exam.description ? `<p>${exam.description}</p>` : ''}
  </div>
  
  <div class="meta">
    <div class="meta-item">
      <div class="label">Duration</div>
      <div class="value">${exam.duration} min</div>
    </div>
    <div class="meta-item">
      <div class="label">Total Marks</div>
      <div class="value">${exam.totalMarks}</div>
    </div>
    <div class="meta-item">
      <div class="label">Passing</div>
      <div class="value">${exam.passingMarks}</div>
    </div>
    <div class="meta-item">
      <div class="label">Version</div>
      <div class="value">v${exam.version}</div>
    </div>
  </div>
  
  <div class="instructions">
    <h3>Instructions</h3>
    <p>${exam.instructions}</p>
  </div>
`;

    let questionNumber = 1;

    exam.sections.forEach((section, sectionIndex) => {
      html += `
  <div class="section">
    <div class="section-header">
      <h2>${section.title}</h2>
      <div class="marks">Total: ${section.totalMarks} marks</div>
    </div>
    ${section.instructions ? `<div class="section-instructions">${section.instructions}</div>` : ''}
    <div class="questions">
`;

      section.questionIds.forEach((qId) => {
        const question = questionsMap.get(qId);
        if (!question) return;

        html += `
      <div class="question">
        <div class="question-header">
          <span class="question-number">Q${questionNumber}</span>
          <div class="question-meta">
            <span class="question-complexity complexity-${question.complexity}">${question.complexity}</span>
            <span class="question-marks">${question.weight} marks</span>
          </div>
        </div>
        <div class="question-text">${question.text}</div>
`;

        if (question.options && question.options.length > 0) {
          html += `<div class="options">`;
          const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
          question.options.forEach((opt, optIndex) => {
            const isCorrect = includeAnswers && opt.isCorrect;
            html += `
          <div class="option ${isCorrect ? 'correct' : ''}">
            <span class="option-marker">${optionLabels[optIndex]}</span>
            <span>${opt.text}</span>
          </div>
`;
          });
          html += `</div>`;
        }

        if (includeAnswers) {
          html += `
        <div class="answer-box">
          <h4>Answer</h4>
          <p>${question.answer}</p>
        </div>
`;
          if (question.explanation) {
            html += `
        <div class="explanation">
          <strong>Explanation:</strong> ${question.explanation}
        </div>
`;
          }
        }

        html += `
      </div>
`;
        questionNumber++;
      });

      html += `
    </div>
  </div>
`;
    });

    html += `
  <div class="footer">
    <p>Generated by BloomGate Exam System | Exam ID: ${exam.id}</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

    return { html, exam, questions };
  }

  // ============ College Management ============

  createCollege(createCollegeDto: CreateCollegeDto): College {
    const college: College = {
      id: uuidv4(),
      ...createCollegeDto,
      isActive: true,
    };
    this.colleges.set(college.id, college);
    return college;
  }

  getAllColleges(): College[] {
    return Array.from(this.colleges.values());
  }

  getCollege(id: string): College {
    const college = this.colleges.get(id);
    if (!college) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }
    return college;
  }

  // ============ Distribution ============

  distributeExam(examId: string, collegeIds: string[]): Exam {
    const exam = this.findOne(examId);

    const newDistributions = collegeIds.map((collegeId) => {
      const college = this.getCollege(collegeId);
      return {
        collegeId,
        collegeName: college.name,
        email: college.email,
        distributedAt: new Date(),
      };
    });

    const updatedExam = new Exam({
      ...exam,
      status: ExamStatus.DISTRIBUTED,
      distributions: [...exam.distributions, ...newDistributions],
      updatedAt: new Date(),
    });

    this.exams.set(examId, updatedExam);
    return updatedExam;
  }

  // ============ Modifications with BloomJoin ============

  modifyDistributedExam(dto: ModifyDistributedExamDto): {
    exam: Exam;
    syncData: {
      filter: { bitArray: number[]; size: number; hashCount: number };
      modificationsToSync: ExamModification[];
      affectedColleges: string[];
    };
  } {
    const exam = this.findOne(dto.examId);

    if (
      exam.status !== ExamStatus.DISTRIBUTED &&
      exam.status !== ExamStatus.MODIFIED
    ) {
      throw new BadRequestException('Can only modify distributed exams');
    }

    const newModifications: ExamModification[] = dto.modifications.map(
      (mod) => ({
        id: uuidv4(),
        timestamp: new Date(),
        questionId: mod.questionId,
        changeType: mod.changeType,
        description: mod.description,
        syncedToColleges: [],
      }),
    );

    // Apply modifications to sections
    const updatedSections = [...exam.sections];
    dto.modifications.forEach((mod) => {
      if (mod.changeType === 'remove') {
        updatedSections.forEach((section) => {
          section.questionIds = section.questionIds.filter(
            (id) => id !== mod.questionId,
          );
        });
      } else if (mod.changeType === 'add' && mod.newQuestionId) {
        // Add to first section by default
        if (updatedSections.length > 0) {
          updatedSections[0].questionIds.push(mod.newQuestionId);
        }
      }
    });

    const updatedExam = new Exam({
      ...exam,
      sections: updatedSections,
      modifications: [...exam.modifications, ...newModifications],
      status: ExamStatus.MODIFIED,
      version: exam.version + 1,
      updatedAt: new Date(),
    });

    this.exams.set(dto.examId, updatedExam);

    // Generate bloom filter for sync
    const modificationIds = newModifications.map((m) => m.id);
    const filter = this.bloomFilterService.createModificationFilter(
      dto.examId,
      modificationIds,
    );

    return {
      exam: updatedExam,
      syncData: {
        filter,
        modificationsToSync: newModifications,
        affectedColleges: exam.distributions.map((d) => d.collegeId),
      },
    };
  }

  // ============ Sync with BloomJoin ============

  syncWithCollege(
    examId: string,
    collegeId: string,
    collegeModifications: { id: string; questionId: string }[],
  ): {
    needsSync: boolean;
    modificationsToApply: ExamModification[];
  } {
    const exam = this.findOne(examId);

    // Create bloom filter from master modifications
    const masterModIds = exam.modifications.map((m) => m.id);

    // Use bloom join to find which college modifications need syncing
    const { matchingRecords } = this.bloomFilterService.performBloomJoin(
      exam.modifications.map((m) => ({ id: m.id, questionId: m.questionId })),
      collegeModifications,
      masterModIds,
    );

    const modificationsToApply = exam.modifications.filter(
      (m) => !matchingRecords.some((mr) => mr.id === m.id),
    );

    return {
      needsSync: modificationsToApply.length > 0,
      modificationsToApply,
    };
  }

  // ============ Get Full Exam with Questions ============

  getExamWithQuestions(examId: string): {
    exam: Exam;
    sections: Array<{
      section: ExamSection;
      questions: any[];
    }>;
  } {
    const exam = this.findOne(examId);

    const sections = exam.sections.map((section) => ({
      section,
      questions: this.questionsService.getByIds(section.questionIds),
    }));

    return { exam, sections };
  }
}
