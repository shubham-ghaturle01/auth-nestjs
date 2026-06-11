import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ForbiddenException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'USER',
    });

    const verificationToken = this.generateEmailVerificationToken(user.id, user.email);
    await this.emailService.sendEmailVerification(user.email, verificationToken);

    return {
      message: 'User registered. Please verify your email address.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isVerified) {
      throw new ForbiddenException('Email address is not verified');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.usersService.update(user.id, {
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12),
    });

    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { sub, email, role } = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.getTokens(user.id, email, role);
    await this.usersService.update(user.id, {
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12),
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const token = this.generateResetPasswordToken(user.id, user.email);
    await this.emailService.sendResetPassword(user.email, token);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    const payload = await this.verifyResetPasswordToken(dto.token);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid reset password token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const payload = await this.verifyEmailVerificationToken(token);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }
    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    await this.usersService.update(user.id, { isVerified: true });
    return { message: 'Email verified successfully' };
  }

  private async getTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN') || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  private generateEmailVerificationToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email }, {
      secret: this.configService.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      expiresIn: this.configService.get<string>('EMAIL_VERIFICATION_TOKEN_EXPIRES_IN') || '24h',
    });
  }

  private async verifyEmailVerificationToken(token: string) {
    try {
      return this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Email verification token invalid or expired');
    }
  }

  private async verifyResetPasswordToken(token: string) {
    try {
      return this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Reset password token invalid or expired');
    }
  }

  private generateResetPasswordToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email }, {
      secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
      expiresIn: this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRES_IN') || '1h',
    });
  }
}
