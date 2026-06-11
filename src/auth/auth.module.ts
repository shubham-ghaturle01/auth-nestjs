import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from './email.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN') || '15m' },
      }),
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, EmailService, JwtAuthGuard, JwtRefreshGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
