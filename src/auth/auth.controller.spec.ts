import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      validateRefreshToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refreshToken', () => {
    it('should return a new access token', async () => {
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      const refreshToken = 'valid-refresh-token';
      const user = { id: '12345', email: 'user@example.com' };
      const newAccessToken = 'new-access-token';

      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue(user);
      jest.spyOn(authService, 'refreshToken').mockResolvedValue({
        user,
        newAccessToken,
      });

      await controller.refreshToken(refreshToken, mockRes);

      expect(authService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: newAccessToken,
        user,
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      jest.spyOn(authService, 'validateRefreshToken').mockImplementation(() => {
        throw new UnauthorizedException('Invalid refresh token');
      });

      await expect(
        controller.refreshToken(refreshToken, {} as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
