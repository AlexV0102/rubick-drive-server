import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google-url')
  getGoogleAuthUrl(@Res() res): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/auth/google/callback';
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    res.json({ url });
  }

  @Post('google-login')
  async googleLogin(@Body('token') token: string, @Res() res): Promise<void> {
    const user = await this.authService.validateGoogleToken(token);
    const jwt = this.authService.generateJwt(user);
    res.json({ token: jwt, user });
  }
}
