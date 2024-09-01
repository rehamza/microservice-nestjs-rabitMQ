import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { InvoiceService } from './invoice.service';
import { Invoice } from ' /common';
import { DAILY_SALES_REPORT_SERVICE } from '../constants/rmqServices';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { mockDeep } from 'jest-mock-extended';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let mockInvoiceModel;
  let mockSalesReportService: ClientProxy;

  beforeEach(async () => {
    mockSalesReportService = mockDeep<ClientProxy>();
    const configServiceMock = {
      get: jest.fn().mockReturnValue('test@example.com')
    };
    mockInvoiceModel = { ... };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
        { provide: DAILY_SALES_REPORT_SERVICE, useValue: mockSalesReportService },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });
  it('should create an invoice', async () => {
    const invoiceDto = new CreateInvoiceDto();
    invoiceDto.customer = 'Test Customer';
    invoiceDto.amount = 100;
    invoiceDto.reference = '1A123';
    invoiceDto.items = [];

    const result = await service.create(invoiceDto);

    expect(result.customer).toEqual(invoiceDto.customer);
    expect(result.amount).toEqual(invoiceDto.amount);
    expect(result.reference).toEqual(invoiceDto.reference);
    expect(result._id).toBeDefined(); // Check that an _id was assigned
  });

  it('should retrieve a specific invoice by ID', async () => {
    const invoiceId = (
      await service.findOne({ reference: '1A123' })
    )._id.toString();
    mockInvoiceModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: invoiceId,
        customer: 'Test Customer',
        amount: 100,
        reference: '1A123',
        items: [],
      }),
    });

    const result = await service.findById(invoiceId);

    expect(result._id).toEqual(invoiceId);
    expect(result.customer).toEqual('Test Customer');
    expect(result.amount).toEqual(100);
    expect(result.reference).toEqual('1A123');
  });

  it('should find all invoices', async () => {
    mockInvoiceModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'id1',
          customer: 'Customer 1',
          amount: 100,
          reference: 'Ref1',
          items: [],
        },
        {
          _id: 'id2',
          customer: 'Customer 2',
          amount: 200,
          reference: 'Ref2',
          items: [],
        },
      ]),
    });

    const results = await service.findAll();
    expect(results.length).toBeGreaterThan(1);
  });

  it('should handle daily sales report cron job', async () => {
    await service.handleCron();

    expect(mockInvoiceModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdAt: {
            $gte: expect.any(Date),
            $lt: expect.any(Date),
          },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.sku',
          totalQuantity: { $sum: '$items.qt' },
          totalSales: { $sum: { $multiply: ['$items.qt', '$items.price'] } },
        },
      },
    ]);

    expect(mockSalesReportService.emit).toHaveBeenCalledWith(
      'daily_sales_report',
      {
        salesData: [{ _id: 'item1', totalQuantity: 10, totalSales: 100 }],
        receiverEmail: 'test@example.com',
      },
    );
  });
});
