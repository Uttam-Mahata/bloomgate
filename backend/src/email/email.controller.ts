import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { to: string; subject: string; html: string },
  ) {
    const result = await this.emailService.sendEmail(body);
    return { success: result };
  }

  @Post('distribute')
  async distributeExam(
    @Body()
    body: {
      examTitle: string;
      pdfHtml: string;
      colleges: { id: string; name: string; email: string }[];
    },
  ) {
    return this.emailService.distributeExamToColleges(
      body.examTitle,
      body.pdfHtml,
      body.colleges,
    );
  }

  @Post('notify-modification')
  async notifyModification(
    @Body()
    body: {
      examTitle: string;
      modifications: { changeType: string; description: string }[];
      colleges: { id: string; name: string; email: string }[];
    },
  ) {
    return this.emailService.sendModificationNotification(
      body.examTitle,
      body.modifications,
      body.colleges,
    );
  }
}

