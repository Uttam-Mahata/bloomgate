import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string;
    encoding?: string;
  }[];
}

export interface DistributionResult {
  collegeId: string;
  collegeName: string;
  email: string;
  status: 'sent' | 'failed';
  timestamp: Date;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send an email (mock implementation - replace with actual email provider)
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In production, integrate with:
      // - Nodemailer for SMTP
      // - SendGrid, AWS SES, or similar services

      this.logger.log(`Sending email to: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Send exam paper to multiple colleges
   */
  async distributeExamToColleges(
    examTitle: string,
    pdfHtml: string,
    colleges: { id: string; name: string; email: string }[],
  ): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];

    for (const college of colleges) {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f7fafc;
      padding: 30px;
      border: 1px solid #e2e8f0;
      border-top: none;
    }
    .highlight {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #718096;
      font-size: 12px;
      background: #edf2f7;
      border-radius: 0 0 10px 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓 BloomGate Exam System</h1>
    <p>Exam Paper Distribution</p>
  </div>
  <div class="content">
    <h2>Dear ${college.name},</h2>
    <p>An examination paper has been distributed to your institution through the BloomGate Exam Management System.</p>
    
    <div class="highlight">
      <h3 style="margin-top: 0; color: #1a365d;">📋 Exam Details</h3>
      <p><strong>Exam Title:</strong> ${examTitle}</p>
      <p><strong>Distribution Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Distribution Time:</strong> ${new Date().toLocaleTimeString()}</p>
    </div>
    
    <p>The exam paper has been attached to this email in PDF format. Please ensure:</p>
    <ul>
      <li>The document is stored securely</li>
      <li>Access is restricted to authorized personnel only</li>
      <li>Any modifications will be communicated through the system</li>
    </ul>
    
    <p style="margin-top: 30px;">
      <strong>Important:</strong> If any modifications are made to this exam after distribution, 
      you will receive automatic updates through our BloomJoin synchronization system.
    </p>
  </div>
  <div class="footer">
    <p>This is an automated message from BloomGate Exam System</p>
    <p>© ${new Date().getFullYear()} BloomGate. All rights reserved.</p>
  </div>
</body>
</html>
      `;

      const success = await this.sendEmail({
        to: college.email,
        subject: `[BloomGate] Exam Distribution: ${examTitle}`,
        html: emailHtml,
        attachments: [
          {
            filename: `${examTitle.replace(/\s+/g, '_')}.html`,
            content: pdfHtml,
            encoding: 'utf-8',
          },
        ],
      });

      results.push({
        collegeId: college.id,
        collegeName: college.name,
        email: college.email,
        status: success ? 'sent' : 'failed',
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Send modification notification to colleges
   */
  async sendModificationNotification(
    examTitle: string,
    modifications: { changeType: string; description: string }[],
    colleges: { id: string; name: string; email: string }[],
  ): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];

    const modificationsList = modifications
      .map(
        (m) =>
          `<li><strong>${m.changeType.toUpperCase()}:</strong> ${m.description}</li>`,
      )
      .join('');

    for (const college of colleges) {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #fef2f2;
      padding: 30px;
      border: 1px solid #fecaca;
      border-top: none;
    }
    .modifications {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #fecaca;
      margin: 20px 0;
    }
    .modifications ul {
      margin: 0;
      padding-left: 20px;
    }
    .modifications li {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #718096;
      font-size: 12px;
      background: #fee2e2;
      border-radius: 0 0 10px 10px;
    }
    .urgent {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Exam Modification Alert</h1>
    <p>BloomGate Exam System</p>
  </div>
  <div class="content">
    <h2>Dear ${college.name},</h2>
    <p>Important modifications have been made to an examination paper that was previously distributed to your institution.</p>
    
    <div class="modifications">
      <h3 style="margin-top: 0; color: #991b1b;">📝 Modifications</h3>
      <p><strong>Exam:</strong> ${examTitle}</p>
      <p><strong>Modified:</strong> ${new Date().toLocaleString()}</p>
      <ul>
        ${modificationsList}
      </ul>
    </div>
    
    <div class="urgent">
      <strong>🔄 Action Required:</strong> Please download the updated exam paper from the BloomGate portal 
      to ensure you have the latest version.
    </div>
  </div>
  <div class="footer">
    <p>This notification was generated automatically by the BloomJoin synchronization system</p>
    <p>© ${new Date().getFullYear()} BloomGate. All rights reserved.</p>
  </div>
</body>
</html>
      `;

      const success = await this.sendEmail({
        to: college.email,
        subject: `[URGENT] Exam Modified: ${examTitle}`,
        html: emailHtml,
      });

      results.push({
        collegeId: college.id,
        collegeName: college.name,
        email: college.email,
        status: success ? 'sent' : 'failed',
        timestamp: new Date(),
      });
    }

    return results;
  }
}
