import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ message: 'User registered' }),
  login: jest.fn().mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' }),
  refreshTokens: jest.fn().mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' }),
  logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
  forgotPassword: jest.fn().mockResolvedValue({ message: 'Password reset sent' }),
  changePassword: jest.fn().mockResolvedValue({ message: 'Password changed' }),
  resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset successfully' }),
  verifyEmail: jest.fn().mockResolvedValue({ message: 'Email verified' }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register and return a success message', async () => {
    await expect(controller.register({ name: 'Jane', email: 'jane@example.com', password: 'secure123' })).resolves.toEqual({ message: 'User registered' });
  });
});
