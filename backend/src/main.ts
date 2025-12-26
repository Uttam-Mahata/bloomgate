import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix for API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎓 BloomGate Exam Paper Generator                          ║
║   ─────────────────────────────────────────────────────────   ║
║                                                               ║
║   Server running at: http://localhost:${port}                   ║
║   API Endpoint:      http://localhost:${port}/api               ║
║                                                               ║
║   Features:                                                   ║
║   • Question Bank Management (weights & complexity)          ║
║   • Smart Exam Paper Generation                              ║
║   • PDF Export & Distribution                                ║
║   • BloomJoin Sync for Modifications                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
