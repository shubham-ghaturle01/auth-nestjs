import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { EmailService } from '../src/auth/email.service';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'user-id',
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'hashed-password',
  role: 'USER',
  isVerified: true,
  refreshTokenHash: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('token'),
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest.fn().mockResolvedValue({ sub: mockUser.id, email: mockUser.email, role: mockUser.role }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: EmailService, useValue: { sendEmailVerification: jest.fn(), sendResetPassword: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user and send verification email', async () => {
    jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('hashed-password');
    (usersService as any).findByEmail = jest.fn().mockResolvedValue(null);
    await expect(service.register({ name: 'Jane', email: 'jane@example.com', password: 'secure123' })).resolves.toEqual({
      message: 'User registered. Please verify your email address.',
    });
  });

  it('should throw unauthorized for invalid login password', async () => {
    jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);
    await expect(service.login({ email: 'jane@example.com', password: 'wrong' })).rejects.toThrow();
  });
});
