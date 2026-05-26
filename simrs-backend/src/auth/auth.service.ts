import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string) {
    const usernameKey = this.configService.getOrThrow<string>('SIMRS_ADMIN_USERNAME_KEY');
    const passwordKey = this.configService.getOrThrow<string>('SIMRS_ADMIN_PASSWORD_KEY');
    
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        CAST(AES_DECRYPT(usere, ${usernameKey}) AS CHAR) as username,
        CAST(AES_DECRYPT(passworde, ${passwordKey}) AS CHAR) as decoded_password
      FROM admin
      WHERE AES_DECRYPT(usere, ${usernameKey}) = ${username}
    `;

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Username tidak ditemukan');
    }

    const user = result[0];

    if (user.decoded_password !== password) {
      throw new UnauthorizedException('Kata sandi salah');
    }

    // Jika berhasil, generate JWT
    const payload = { sub: user.username, role: 'admin' };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        username: user.username,
        role: 'admin'
      }
    };
  }
}
