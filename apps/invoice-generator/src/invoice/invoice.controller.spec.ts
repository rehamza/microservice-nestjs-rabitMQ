import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InvoiceModule } from './invoice.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        InvoiceModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: './apps/invoice-generator/.env',
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI_TEST'),
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  it('/invoice (POST) and /invoice/:id (GET)', async () => {
    // Create an invoice
    const postResponse = await request(app.getHttpServer())
      .post('/invoice')
      .send({
        customer: 'Test Customer',
        reference: '2A123',
        amount: 100,
        items: [{ sku: 'item1', qt: 2 }],
      })
      .expect(201);

    expect(postResponse.body.data.customer).toEqual('Test Customer');

    const createdId = postResponse.body.data._id.toString();

    // Retrieve the created invoice by ID
    const getResponse = await request(app.getHttpServer())
      .get(`/invoice/${createdId}`)
      .expect(200);

    expect(getResponse.body.data._id.toString()).toEqual(createdId);
    expect(getResponse.body.data.customer).toEqual('Test Customer');
  }, 60000);

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  }, 30000);
});
