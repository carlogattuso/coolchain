import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AUTH_THROTTLER_LIMIT, AUTH_THROTTLER_TTL } from '../utils/constants';
import { AuditorsModule } from '../auditors/auditors.module';

@Module({
  imports: [
    PrismaModule,
    AuditorsModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: AUTH_THROTTLER_TTL,
        limit: AUTH_THROTTLER_LIMIT,
      },
    ]),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
