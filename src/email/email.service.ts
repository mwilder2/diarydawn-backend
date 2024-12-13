import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { CustomLoggerService } from 'src/common/services/custom-logger.service';
import nodemailer from "nodemailer";



@Injectable()
export class EmailService {
  private ses: AWS.SES;
  private transporter;

  constructor(private configService: ConfigService,
    private readonly customLoggerService: CustomLoggerService,
  ) {

    this.customLoggerService.setContext('EmailService');

    AWS.config.update({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.ses = new AWS.SES({
      apiVersion: '2010-12-01'
    });

    // Create an SES transporter
    this.transporter = nodemailer.createTransport({
      SES: new AWS.SES({
        apiVersion: '2010-12-01'
      })
    });

  }
  async sendEmail(to: string, subject: string, message: string, isHtml: boolean = false) {
    const bodyContent = isHtml ? {
      Html: { Data: message } // For HTML content
    } : {
      Text: { Data: message } // For plain text content
    };

    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: bodyContent,
        Subject: { Data: subject },
      },
      Source: 'acana86@gmail.com',
    };

    this.customLoggerService.log(`Email sent successfully to ${to}, subject ${subject}, message ${message}`, 'sendEmail');

    try {

      if (process.env.NODE_ENV === 'development') {
        this.customLoggerService.log(`Email sent to ${to}: ${message}`, 'sendEmail');
        return 'Email sent successfully';
      } else {
        await this.ses.sendEmail(params).promise();
        this.customLoggerService.log(`Email sent successfully to ${to}`, 'sendEmail');
        return 'Email sent successfully';
      }
    } catch (error) {
      this.customLoggerService.error(`Failed to send email to ${to}: ${error.message}`, 'sendEmail');
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordRecoveryEmail(to: string, recoveryCode: string) {
    const subject = 'Password Recovery Instructions';
    const baseUrl = this.configService.get<string>('BASE_URL');
    const message = `
    <p>You've initiated a password reset process. Please follow the steps below to complete your password reset:</p>
    <ol>
      <li>Copy your password reset code: <strong>${recoveryCode}</strong></li>
      <li>Click on the button below to go directly to the password reset page:</li>
    </ol>
    <table cellspacing="0" cellpadding="0"> <tr>
        <td align="center" width="300" height="40" bgcolor="#36817A" style="border-radius: 4px; color: #ffffff; display: block;">
            <a href="${baseUrl}/reset-password?step=reset&code=${recoveryCode}" style="font-size:16px; font-weight:bold; color: #ffffff; text-decoration: none; line-height:40px; width:100%; display:inline-block">Click to Reset Password</a>
        </td>
    </tr> </table>
    <p>If you did not request this change, please ignore this email or contact our support team immediately for assistance.</p>
    `;

    if (process.env.NODE_ENV === 'development') {
      this.customLoggerService.log(`Email sent to ${to} with recovery code: ${recoveryCode}`, 'sendPasswordRecoveryEmail');
    } else {
      await this.sendEmail(to, subject, message, true); // Pass true for HTML content
    }
  }


  async sendMeEmail(to: string, subject: string, message: string, isHtml: boolean = false) {
    const bodyContent = isHtml ? {
      Html: { Data: message } // For HTML content
    } : {
      Text: { Data: message } // For plain text content
    };

    const params = {
      Destination: {
        ToAddresses: ['acana86@gmail.com'],
      },
      Message: {
        Body: bodyContent,
        Subject: { Data: to + ' ' + subject },
      },
      Source: 'acana86@gmail.com',
    };

    try {

      if (process.env.NODE_ENV === 'development') {
        this.customLoggerService.log(`Email sent to ${to}: ${message}`, 'sendMeEmail');
        return 'Email sent successfully';
      } else {
        await this.ses.sendEmail(params).promise();
        this.customLoggerService.log(`Email sent successfully to ${to}`, 'sendMeEmail');
        return 'Email sent successfully';
      }
    } catch (error) {
      this.customLoggerService.error(`Failed to send email to ${to}: ${error.message}`, 'sendMeEmail');
      throw new Error('Failed to send email');
    }
  }

  async sendResultsImageEmail(to: string, imageBuffer: Buffer): Promise<string> {

    const mailOptions = {
      from: 'acana86@gmail.com',
      to: to,
      subject: 'Your Results Image',
      html: `<p>You've requested your results to be shared.</p><p>Find your results image attached to this email.</p>`,
      attachments: [{
        filename: 'results-image.png',
        content: imageBuffer,
        contentType: 'image/png'
      }]
    };

    // Send mail with defined transport object
    try {

      if (process.env.NODE_ENV === 'development') {
        this.customLoggerService.log(`Email sent to ${to} with image attachment`, 'sendResultsImageEmail');
        return 'Email sent successfully';
      }

      else {
        const info = await this.transporter.sendMail(mailOptions);
        this.customLoggerService.log(`Email sent successfully to ${to}: ${info.messageId}`, 'sendResultsImageEmail');
        return 'Email sent successfully';
      }

    } catch (error) {
      this.customLoggerService.error(`Failed to send email to ${to}: ${error.message}`, 'sendResultsImageEmail');
      throw new Error('Failed to send email');
    }
  }
}
// import * as AWS from "@aws-sdk/client-ses";
// const nodemailer = require("nodemailer");
// import * as nodemailer from "nodemailer";