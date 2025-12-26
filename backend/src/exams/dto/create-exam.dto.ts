import { ExamSection, ExamStatus } from '../entities/exam.entity';

export class CreateExamDto {
  title: string;
  subject: string;
  description?: string;
  instructions: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  sections: ExamSection[];
}

export class UpdateExamDto {
  title?: string;
  subject?: string;
  description?: string;
  instructions?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  sections?: ExamSection[];
  status?: ExamStatus;
}

export class AddQuestionToExamDto {
  sectionId: string;
  questionId: string;
}

export class RemoveQuestionFromExamDto {
  sectionId: string;
  questionId: string;
}

export class GenerateExamDto {
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
}

export class DistributeExamDto {
  examId: string;
  collegeIds: string[];
}

export class CreateCollegeDto {
  name: string;
  email: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
}

export class ModifyDistributedExamDto {
  examId: string;
  modifications: {
    questionId: string;
    changeType: 'add' | 'remove' | 'update';
    newQuestionId?: string; // For replacement
    description: string;
  }[];
}

