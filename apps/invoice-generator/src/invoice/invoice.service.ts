import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { Invoice, InvoiceDocument } from ' /common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DAILY_SALES_REPORT_SERVICE } from '../constants/rmqServices';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @Inject(DAILY_SALES_REPORT_SERVICE) private salesReportService: ClientProxy,
    private configService: ConfigService
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    this.logger.log('Creating a new invoice');
    const createdInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      _id: new mongoose.Types.ObjectId(),
    });
    await createdInvoice.save();
    this.logger.log(`Invoice created with ID: ${createdInvoice._id}`);
    return createdInvoice;
  }

  async findById(id: string): Promise<Invoice> {
    this.logger.log(`Finding invoice by ID: ${id}`);
    const objectId = new Types.ObjectId(id);
    const invoice = await this.invoiceModel.findById(objectId);
    if (!invoice) {
      this.logger.error(`Invoice with ID ${id} not found`);
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    this.logger.log(`Invoice found: ${invoice._id}`);
    return invoice;
  }

  async findOne(obj): Promise<Invoice> {
    this.logger.log('Finding one invoice');
    const invoice = await this.invoiceModel.findOne(obj);
    if (!invoice) {
      this.logger.error('Invoice matching query not found');
      throw new NotFoundException('Invoice matching query not found');
    }
    this.logger.log(`Invoice found: ${invoice._id}`);
    return invoice;
  }

  async findAll(): Promise<Invoice[]> {
    this.logger.log('Finding all invoices');
    const invoices = await this.invoiceModel.find();
    this.logger.log(`Found ${invoices.length} invoices`);
    return invoices;
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCron() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.logger.debug('Sending daily sales report to job start');

    const salesData = await this.invoiceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.sku',
          totalQuantity: { $sum: '$items.qt' },
          totalSales: { $sum: { $multiply: ['$items.qt', '$items.price'] } },
        },
      },
    ]);

    const receiverEmail = this.configService.get<string>('RECEIVER_EMAIL');  // now I have only 1 email that i am getting from env but we can have multiple emails and add into rabit here

    this.logger.debug('Sending daily sales report to RabbitMQ');
    this.salesReportService.emit('daily_sales_report', {
      salesData,
      receiverEmail
    });
  }
}
