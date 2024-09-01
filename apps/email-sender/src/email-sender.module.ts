import { Module } from '@nestjs/common';
import { EmailSenderController } from './email-sender.controller';
import { EmailSenderService } from './email-sender.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from ' /common';
import { EmailService } from './email/email.service';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_DAILY_SALES_REPORT_QUEUE: Joi.string().required(),
      }),
    }),
    RmqModule,
  ],
  controllers: [EmailSenderController],
  providers: [EmailSenderService, EmailService],
})
export class EmailSenderModule {}
