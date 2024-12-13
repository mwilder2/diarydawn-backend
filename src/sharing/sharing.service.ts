import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import jwtConfig from '../auth-core/config/jwt.config';
import { TokenService } from '../auth-core/token.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { EmailService } from '../email/email.service';
import puppeteer from 'puppeteer';
import { emailTemplate } from './html-templates/base-results.template';
import { SharePublicHeroDto } from './dto/share-public-results.dto';
import { Hero, PublicHero } from '../book/entities/enriched-result.model';
import { BookService } from '../book/services/book.service';
import { UserService } from '../user/services/user.service';


@Injectable()
export class SharingService {
  private s3: AWS.S3;

  constructor(
    private configService: ConfigService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenService: TokenService,
    private readonly logger: CustomLoggerService,
    private readonly emailService: EmailService,
    private readonly bookService: BookService,
    private readonly userService: UserService,
  ) {

    this.logger.setContext('SharingService');

    AWS.config.update({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.s3 = new AWS.S3({ apiVersion: '2012-10-17' });
  }

  async saveProfileImageToS3(buffer: Buffer, originalname: string): Promise<string> {
    const params = {
      Bucket: 'diarydawnbucket',
      Key: `profile-images/${Date.now()}-${originalname}`,
      Body: buffer,
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          this.logger.error(`Failed to upload profile image to S3: ${err.message}`);
          reject(new Error(`Failed to upload profile image to S3: ${err.message}`));
        } else {
          this.logger.log(`Profile image uploaded successfully to S3: ${data.Location}`, 'saveProfileImageToS3');
          resolve(data.Location);
        }
      });
    });
  }


  async saveImageToS3(buffer: Buffer, originalname: string, bookId?: number): Promise<string> {
    const params = {
      Bucket: 'diarydawnbucket',
      Key: `${Date.now()}-${originalname}`,
      Body: buffer,
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, async (err, data) => {
        if (err) {
          this.logger.error(`Failed to upload file to S3: ${err.message}`);
          reject(new Error(`Failed to upload file to S3: ${err.message}`));
        } else {
          this.logger.log(`File uploaded successfully to S3: ${data.Location}`, 'saveImageToS3');
          if (bookId) {
            // Save the S3 URL to the database for the book
            await this.updateBookWithImageUrl(bookId, data.Location);
          }
          resolve(data.Location);
        }
      });
    });
  }

  async generateHeroImage(data: PublicHero[] | Hero[]): Promise<Buffer> {
    let browser;
    try {

      const browser = await puppeteer.launch({
        // Optionally set the executable path if needed for specific environments
        // executablePath: process.env.PUPPETEER_EXEC_PATH || undefined, // only set this if PUPPETEER_EXEC_PATH is defined
        executablePath: '/usr/bin/google-chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--allow-file-access-from-files',
          '--enable-local-file-accesses'
        ].concat(process.env.PUPPETEER_EXTRA_ARGS ? process.env.PUPPETEER_EXTRA_ARGS.split(' ') : [])
      });
      const page = await browser.newPage();
      this.logger.log(`Generating hero image with data: ${JSON.stringify(data)}`, 'generateHeroImage');

      const topImageUrl = 'https://diarydawnbucket.s3.amazonaws.com/profile-images/1715202140142-female_fly_left_blue.jpg';
      const bottomImageUrl = 'https://diarydawnbucket.s3.amazonaws.com/profile-images/1715202167747-male_fly_left_blue.jpg';
      const content = this.renderTemplate(emailTemplate, data, topImageUrl, bottomImageUrl);
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      await page.setContent(content, { waitUntil: 'networkidle0' });
      await page.waitForSelector('img');
      const imageBuffer = await page.screenshot({ fullPage: true });
      return imageBuffer;
    } catch (err) {
      this.logger.error(`Failed to generate hero image: ${err.message}`, 'generateHeroImage');
      throw new Error(`Error generating hero image: ${err.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private renderTemplate(template: string, results: PublicHero[] | Hero[], topImageUrl: string, bottomImageUrl: string): string {
    const entriesHtml = results.map(result => `
      <div class="result-entry">
        <h2>${result.modelName}</h2>
        <p><strong>Super Power:</strong> ${result.superPower}</p>
        <p>${result.description}</p>
      </div>
    `).join('');

    return template.replace('{{entries}}', entriesHtml)
      .replace('{{topImage}}', topImageUrl)
      .replace('{{bottomImage}}', bottomImageUrl);
  }

  // Determines the action based on where the result needs to be shared
  async sortAndSharePublicHeroResult(dto: SharePublicHeroDto): Promise<string> {
    const buffer = await this.generateHeroImage(dto.publicHero);
    this.logger.log(`Emailing the results to: ${dto.email}`, 'sortAndSharePublicHeroResult');
    await this.emailService.sendResultsImageEmail(dto.email, buffer);
    // Always save to S3 for authenticated users regardless of sharing method
    const imageUrl = await this.saveImageToS3(buffer, 'hero-image.png');
    return imageUrl;
  }

  async sortAndShareHeroResult(accessToken: string, bookId: number, shareTo?: string): Promise<string> {

    const { email, hero } = await this.getUserEmailAndHero(accessToken, bookId);

    const buffer = await this.generateHeroImage(hero);
    this.logger.log("Buffer generated for hero image", buffer.length.toString());

    // Always save to S3 for authenticated users regardless of sharing method
    const imageUrl = await this.saveImageToS3(buffer, 'hero-image.png', bookId);

    if (shareTo === 'email') {
      this.logger.log("Emailing the results", email);
      await this.emailService.sendResultsImageEmail(email, buffer);
      return imageUrl;  // Return URL or message indicating the email has been sent
    }
    else {
      throw new Error("Invalid sharing option provided");
    }
  }

  async updateBookWithImageUrl(bookId: number, imageUrl: string): Promise<void> {
    this.bookService.saveUrlToBook(bookId, imageUrl);
    this.logger.log(`Book updated with image URL`, JSON.stringify({ bookId, imageUrl }));
  }

  async getUserEmailAndHero(accessToken: string, bookId: number): Promise<{ email: string; hero: Hero[] }> {
    const user = await this.userService.getUser(accessToken);
    const hero = await this.bookService.findResultsByBookAndUser(user.id, bookId);
    return { email: user.email, hero: hero };
  }
}
