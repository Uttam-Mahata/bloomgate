import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExamsService } from './exams.service';
import {
  CreateExamDto,
  UpdateExamDto,
  GenerateExamDto,
  CreateCollegeDto,
  DistributeExamDto,
  ModifyDistributedExamDto,
} from './dto/create-exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // ============ Exam CRUD ============

  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Get(':id/full')
  getExamWithQuestions(@Param('id') id: string) {
    return this.examsService.getExamWithQuestions(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  // ============ Exam Generation ============

  @Post('generate')
  generateExam(@Body() generateExamDto: GenerateExamDto) {
    return this.examsService.generateExam(generateExamDto);
  }

  // ============ PDF Generation ============

  @Get(':id/pdf')
  generatePdf(
    @Param('id') id: string,
    @Query('includeAnswers') includeAnswers: string,
    @Res() res: Response,
  ) {
    const { html, exam } = this.examsService.generatePdfContent(
      id,
      includeAnswers === 'true',
    );

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${exam.title.replace(/\s+/g, '_')}.html"`,
    );
    res.send(html);
  }

  @Get(':id/pdf-content')
  getPdfContent(
    @Param('id') id: string,
    @Query('includeAnswers') includeAnswers: string,
  ) {
    return this.examsService.generatePdfContent(id, includeAnswers === 'true');
  }

  // ============ College Management ============

  @Post('colleges')
  createCollege(@Body() createCollegeDto: CreateCollegeDto) {
    return this.examsService.createCollege(createCollegeDto);
  }

  @Get('colleges/all')
  getAllColleges() {
    return this.examsService.getAllColleges();
  }

  @Get('colleges/:id')
  getCollege(@Param('id') id: string) {
    return this.examsService.getCollege(id);
  }

  // ============ Distribution ============

  @Post('distribute')
  distributeExam(@Body() distributeDto: DistributeExamDto) {
    return this.examsService.distributeExam(
      distributeDto.examId,
      distributeDto.collegeIds,
    );
  }

  // ============ Modifications with BloomJoin ============

  @Post('modify')
  modifyDistributedExam(@Body() modifyDto: ModifyDistributedExamDto) {
    return this.examsService.modifyDistributedExam(modifyDto);
  }

  @Post(':id/sync')
  syncWithCollege(
    @Param('id') id: string,
    @Body()
    body: {
      collegeId: string;
      collegeModifications: { id: string; questionId: string }[];
    },
  ) {
    return this.examsService.syncWithCollege(
      id,
      body.collegeId,
      body.collegeModifications,
    );
  }
}

