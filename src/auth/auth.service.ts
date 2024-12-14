import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  async validateJwt(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  constructor(private readonly jwtService: JwtService) {}

  async validateGoogleToken(token: string): Promise<any> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }

  generateJwt(user: any): string {
    return this.jwtService.sign(
      { id: user.id, email: user.email },
      { secret: process.env.JWT_SECRET },
    );
  }
}
