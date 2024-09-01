import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema()
export class Invoice {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  customer: string; // I added this now directly but can also create separate table for customer and maintain the id only her

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop([{ sku: String, qt: Number }])
  items: Record<string, any>[];
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
