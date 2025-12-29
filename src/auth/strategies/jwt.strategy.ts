import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
}

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and loads user from database
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  /**
   * Validates the JWT payload and returns the user
   * This method is called automatically by Passport after the JWT is verified
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
            classroomId: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    return user;
  }
}

