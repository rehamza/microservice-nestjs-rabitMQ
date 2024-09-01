import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from ' /common';

@Controller()
export class EmailSenderController {
  constructor(
    private readonly emailSenderService: EmailSenderService,
    private readonly rmqService: RmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.emailSenderService.getHello();
  }

  @EventPattern('daily_sales_report')
  // @UseGuards(JwtAuthGuard)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received sales report:', data);
    this.emailSenderService.sendReport(data);
    this.rmqService.ack(context);
  }
}
