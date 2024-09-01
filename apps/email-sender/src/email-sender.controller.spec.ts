import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderController } from './email-sender.controller';
import { EmailSenderService } from './email-sender.service';
import { RmqService } from ' /common';
import { RmqContext } from '@nestjs/microservices';

jest.mock('./email-sender.service');
jest.mock(' /common');

describe('EmailSenderController', () => {
  let controller: EmailSenderController;
  let emailSenderService: EmailSenderService;
  let rmqService: RmqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailSenderController],
      providers: [EmailSenderService, RmqService],
    }).compile();

    controller = module.get<EmailSenderController>(EmailSenderController);
    emailSenderService = module.get<EmailSenderService>(EmailSenderService);
    rmqService = module.get<RmqService>(RmqService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      jest
        .spyOn(emailSenderService, 'getHello')
        .mockImplementation(() => 'Hello World!');
      expect(controller.getHello()).toBe('Hello World!');
    });
  });

  describe('handleOrderCreated', () => {
    it('should handle "daily_sales_report" events', async () => {
      const mockData = { message: 'Test Data' };
      const mockContext = {
        getPattern: jest.fn(),
        getMessage: jest.fn(),
        getChannelRef: jest.fn(),
        getOriginalMessage: jest.fn(),
        args: [],
        getArgs: jest.fn(() => []),
        getArgByIndex: jest.fn((index: number) => null),
      };

      jest
        .spyOn(emailSenderService, 'sendReport')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(rmqService, 'ack').mockImplementation(() => {});

      await controller.handleOrderCreated(
        mockData,
        mockContext as unknown as RmqContext,
      );

      expect(emailSenderService.sendReport).toHaveBeenCalledWith(mockData);
      expect(rmqService.ack).toHaveBeenCalledWith(mockContext);
    });
  });
});
