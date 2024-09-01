import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class EmailSenderService {
  constructor(
    private emailService: EmailService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendReport(data) {
    const { salesData, receiverEmail } = data;
    const to = receiverEmail;
    const subject = 'Daily Sales Report';

    // Construct HTML content for the email
    let html = `<h1>Daily Sales Report</h1>`;
    html += `<p>Here is the detailed report of sales for the day:</p>`;
    html += `<table border="1" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th>SKU</th>
                <th>Total Quantity Sold</th>
                <th>Total Sales</th>
              </tr>`;

    salesData.forEach((item) => {
      html += `<tr>
                <td>${item._id}</td>
                <td>${item.totalQuantity}</td>
                <td>$${item.totalSales.toFixed(2)}</td>
              </tr>`;
    });

    html += `</table>`;

    console.log('Received sales report:', html);

    await this.emailService.sendEmail(
      to,
      subject,
      'Please see the attached report for the sales details.',
      html,
    );
  }
}
