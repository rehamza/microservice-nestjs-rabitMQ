import { NestFactory } from '@nestjs/core';
import { EmailSenderModule } from './email-sender.module';
import { RmqService } from ' /common';
import { DAILY_SALES_REPORT_SERVICE } from './constants/rmqService';

async function bootstrap() {
  const app = await NestFactory.create(EmailSenderModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(DAILY_SALES_REPORT_SERVICE));
  await app.startAllMicroservices();
}
bootstrap();
