import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  FilterQuestionsDto,
  BulkImportDto,
} from './dto/create-question.dto';
import { QuestionComplexity, QuestionType } from './entities/question.entity';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll(
    @Query('subject') subject?: string,
    @Query('topic') topic?: string,
    @Query('complexity') complexity?: QuestionComplexity,
    @Query('type') type?: QuestionType,
    @Query('tags') tags?: string,
    @Query('minWeight') minWeight?: string,
    @Query('maxWeight') maxWeight?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters: FilterQuestionsDto = {
      subject,
      topic,
      complexity,
      type,
      tags: tags ? tags.split(',') : undefined,
      minWeight: minWeight ? parseInt(minWeight) : undefined,
      maxWeight: maxWeight ? parseInt(maxWeight) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };
    return this.questionsService.findAll(filters);
  }

  @Get('statistics')
  getStatistics() {
    return this.questionsService.getStatistics();
  }

  @Get('modified')
  getModified(@Query('since') since?: string) {
    const sinceDate = since ? new Date(since) : undefined;
    return this.questionsService.getModifiedIds(sinceDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Post('bulk-import')
  bulkImport(@Body() bulkImportDto: BulkImportDto) {
    return this.questionsService.bulkImport(bulkImportDto.questions);
  }

  @Post('generate-selection')
  generateSelection(
    @Body()
    criteria: {
      count: number;
      subject?: string;
      complexity?: QuestionComplexity[];
      types?: QuestionType[];
      totalWeight?: number;
    },
  ) {
    return this.questionsService.generateRandomSelection(criteria);
  }
}
