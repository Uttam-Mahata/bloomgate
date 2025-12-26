import { QuestionComplexity, QuestionType, QuestionOption } from '../entities/question.entity';

export class CreateQuestionDto {
  text: string;
  type: QuestionType;
  complexity: QuestionComplexity;
  weight: number;
  subject: string;
  topic: string;
  tags?: string[];
  options?: QuestionOption[];
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

export class UpdateQuestionDto {
  text?: string;
  type?: QuestionType;
  complexity?: QuestionComplexity;
  weight?: number;
  subject?: string;
  topic?: string;
  tags?: string[];
  options?: QuestionOption[];
  answer?: string;
  explanation?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export class FilterQuestionsDto {
  subject?: string;
  topic?: string;
  complexity?: QuestionComplexity;
  type?: QuestionType;
  tags?: string[];
  minWeight?: number;
  maxWeight?: number;
  isActive?: boolean;
}

export class BulkImportDto {
  questions: CreateQuestionDto[];
}

