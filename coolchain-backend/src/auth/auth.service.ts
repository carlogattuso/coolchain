import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCodes } from '../utils/errors';
import { hexlify, randomBytes, verifyMessage } from 'ethers';
import { JwtService } from '@nestjs/jwt';
import { JwtDTO } from '../types/dto/JwtDTO';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from '../types/dto/SignInDTO';
import { createSignInMessage } from './message/message.builder';
import { AUTH_EXPIRATION_TIMEOUT } from '../utils/constants';
import { NonceDTO } from '../types/dto/NonceDTO';
import { Auditor } from '../types/Auditor';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  private readonly domain: string;
  private readonly uri: string;
  private readonly chainId: number;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _prismaService: PrismaService,
    private readonly _jwtService: JwtService,
  ) {
    this.domain = this._configService.get<string>('APP_DOMAIN');
    this.uri = this._configService.get<string>('APP_URI');
    this.chainId = this._configService.get<number>('CHAIN_ID');
  }

  async signIn(_signIn: SignInDTO): Promise<JwtDTO> {
    const { address, signature, nonce } = _signIn;
    if (!address || !signature || !nonce) {
      throw new Error(ErrorCodes.BAD_LOGIN_REQUEST.code);
    }

    let auditor: Auditor;
    try {
      auditor = await this._prismaService.auditor.findUnique({
        where: { address: address },
      });
    } catch (error) {
      this.logger.error(`Error retrieving auditor: ${error.message}`, {
        stack: error.stack,
        auditor: address,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    const currentTime = new Date();
    const issuedAt = new Date(auditor.issuedAt);

    if (currentTime.getTime() - issuedAt.getTime() > AUTH_EXPIRATION_TIMEOUT) {
      throw new Error(ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code);
    }

    if (!auditor || auditor.nonce !== nonce) {
      throw new Error(ErrorCodes.UNAUTHORIZED.code);
    }

    const message: string = createSignInMessage(
      this.domain,
      this.uri,
      this.chainId,
      auditor.address,
      auditor.nonce,
      auditor.issuedAt.toISOString(),
    );

    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(ErrorCodes.UNAUTHORIZED.code);
    }

    const payload = { address: address };
    const token = this._jwtService.sign(payload);

    return { accessToken: token };
  }

  async generateNonce(_address: string): Promise<NonceDTO> {
    if (!_address) {
      throw new Error(ErrorCodes.ADDRESS_REQUIRED.code);
    }

    const nonce: string = hexlify(randomBytes(32));
    const issuedAt: Date = new Date();

    await this._prismaService.auditor.upsert({
      where: { address: _address },
      update: { nonce, issuedAt },
      create: { address: _address, nonce: nonce, issuedAt: issuedAt },
    });

    return {
      nonce,
      issuedAt,
    };
  }
}
