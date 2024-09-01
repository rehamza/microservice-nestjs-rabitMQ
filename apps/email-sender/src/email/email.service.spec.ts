import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'SENDGRID_API_KEY':
            return 'fake-api-key';
          case 'SENDGRID_SENDER_EMAIL':
            return 'sender@example.com';
          default:
            return null;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    sgMail.send = jest.fn(); // Reset sgMail.send to a jest mock function before each test
  });

  it('should send an email successfully', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test text';
    const html = '<p>Test HTML Content</p>';

    (sgMail.send as jest.Mock).mockResolvedValue({}); // Use casting to jest.Mock

    await expect(
      service.sendEmail(to, subject, text, html),
    ).resolves.not.toThrow();
    expect(sgMail.send).toHaveBeenCalledWith({
      to,
      from: 'sender@example.com',
      subject,
      text,
      html,
    });
  });

  it('should handle errors when sending an email', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test text';
    const html = '<p>Test HTML Content</p>';

    (sgMail.send as jest.Mock).mockRejectedValue(
      new Error('Failed to send email'),
    ); // Use casting to jest.Mock

    await expect(service.sendEmail(to, subject, text, html)).rejects.toThrow(
      'Unable to send email',
    );
  });
});
