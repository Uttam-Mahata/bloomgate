import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; version: string; endpoints: string[] } {
    return {
      message: 'BloomGate Exam Paper Generator API',
      version: '1.0.0',
      endpoints: [
        'GET /api/questions - List all questions',
        'POST /api/questions - Create a question',
        'GET /api/questions/statistics - Get question statistics',
        'GET /api/exams - List all exams',
        'POST /api/exams - Create an exam',
        'POST /api/exams/generate - Auto-generate exam',
        'GET /api/exams/:id/pdf - Get exam PDF',
        'POST /api/exams/distribute - Distribute to colleges',
        'POST /api/exams/modify - Modify distributed exam',
        'GET /api/exams/colleges/all - List all colleges',
        'POST /api/bloom-filter/bloom-join - Perform bloom join',
      ],
    };
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
