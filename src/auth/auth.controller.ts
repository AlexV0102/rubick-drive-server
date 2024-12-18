import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google-url')
  @ApiResponse({
    status: 200,
    description: 'Returns the Google OAuth2 login URL.',
    schema: {
      example: {
        url: 'https://accounts.google.com/o/oauth2/auth?client_id=...',
      },
    },
  })
  getGoogleAuthUrl(@Res() res): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/auth/google/callback';
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    res.json({ url });
  }

  @Post('google-login')
  @ApiBody({
    description: 'Google ID token for authentication.',
    schema: { example: { token: 'your-google-id-token' } },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access and refresh tokens along with user details.',
    schema: {
      example: {
        accessToken: 'your-access-token',
        refreshToken: 'your-refresh-token',
        user: { id: '12345', email: 'user@example.com', name: 'John Doe' },
      },
    },
  })
  async googleLogin(@Body('token') token: string, @Res() res): Promise<void> {
    const user = await this.authService.validateGoogleToken(token);
    const accessToken = this.authService.generateJwt(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  }

  @Post('refresh-token')
  @ApiBody({
    description: 'Refresh token to generate a new access token.',
    schema: { example: { token: 'your-refresh-token' } },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a new access token.',
    schema: {
      example: {
        accessToken: 'your-new-access-token',
        user: { id: '12345', email: 'user@example.com' },
      },
    },
  })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Res() res,
  ): Promise<void> {
    const isValid = await this.authService.validateRefreshToken(refreshToken);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }
    const { user, newAccessToken: jwt } =
      await this.authService.refreshToken(refreshToken);
    res.json({ accessToken: jwt, user });
  }
}
