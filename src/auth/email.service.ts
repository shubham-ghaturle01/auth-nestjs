import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmailVerification(email: string, token: string) {
    const link = `https://your-app.com/verify-email?token=${token}`;
    this.logger.log(`Send verification email to ${email}: ${link}`);
  }

  async sendResetPassword(email: string, token: string) {
    const link = `https://your-app.com/reset-password?token=${token}`;
    this.logger.log(`Send reset password email to ${email}: ${link}`);
  }
}
