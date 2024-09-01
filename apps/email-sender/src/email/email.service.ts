import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
    constructor(private configService: ConfigService) {
        sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
      }
    
      async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
        const msg = {
          to,
          from: this.configService.get<string>('SENDGRID_SENDER_EMAIL'), // Use your verified sender email
          subject,
          text,
          html,
        };
    
        try {
          await sgMail.send(msg);
          console.error('Email Sent successfullly');

        } catch (error) {
          console.error('Error sending email:', error);
          throw new Error('Unable to send email');
        }
      }
}
