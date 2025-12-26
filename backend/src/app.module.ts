import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { BloomFilterModule } from './bloom-filter/bloom-filter.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [QuestionsModule, ExamsModule, BloomFilterModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
