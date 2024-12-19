import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            sub: '123',
            email: 'test@example.com',
            name: 'John Doe',
          }),
        }),
      };
    }),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let googleClientMock: jest.Mocked<OAuth2Client>;

  beforeEach(async () => {
    googleClientMock = new OAuth2Client() as jest.Mocked<OAuth2Client>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJwt', () => {
    it('should generate an access token', () => {
      const user = { id: '123', email: 'test@example.com' };
      jest.spyOn(jwtService, 'sign').mockReturnValue('access-token');

      const result = service.generateJwt(user);

      expect(result).toEqual('access-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate refresh token', async () => {
      const decoded = { id: '123' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(decoded);

      const result = await service.validateRefreshToken('valid-refresh-token');

      expect(result).toEqual(decoded);
    });

    it('should throw UnauthorizedException if invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(
        service.validateRefreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should generate a new access token', async () => {
      const decoded = { id: '123', email: 'test@example.com' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(decoded);
      jest.spyOn(service, 'generateJwt').mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        user: { id: decoded.id, email: decoded.email },
        newAccessToken: 'new-access-token',
      });
    });
  });

  describe('validateGoogleToken', () => {
    it('should validate Google token and return user data', async () => {
      const mockPayload = {
        sub: '123',
        email: 'test@example.com',
        name: 'John Doe',
      };
      googleClientMock.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => mockPayload,
      });

      const result = await service.validateGoogleToken('google-token');

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        name: mockPayload.name,
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest
        .spyOn(service['googleClient'], 'verifyIdToken')
        .mockImplementation(() => {
          throw new UnauthorizedException('Invalid token');
        });

      await expect(
        service.validateGoogleToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
