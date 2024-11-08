import { Injectable } from '@nestjs/common';
import { ErrorCodes } from '../utils/errors';
import { verifyMessage } from 'ethers';
import { JwtService } from '@nestjs/jwt';
import { JwtDTO } from './types/dto/JwtDTO';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './types/dto/SignInDTO';
import { createSIWEMessage } from './message/message.builder';
import { AUTH_EXPIRATION_TIMEOUT } from '../utils/constants';
import { Auditor } from '../auditors/types/Auditor';
import { MessageDTO } from './types/dto/MessageDTO';
import { AuditorsService } from '../auditors/auditors.service';

@Injectable()
export class AuthService {
  private readonly domain: string;
  private readonly chainId: number;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _auditorsService: AuditorsService,
    private readonly _jwtService: JwtService,
  ) {
    this.domain = this._configService.get<string>('ORIGIN');
    this.chainId = this._configService.get<number>('CHAIN_ID');
  }

  async generateMessageToSign(_auditorAddress: string): Promise<MessageDTO> {
    if (!_auditorAddress) {
      throw new Error(ErrorCodes.ADDRESS_REQUIRED.code);
    }

    let auditor: Auditor =
      await this._auditorsService.findOrCreateAuditor(_auditorAddress);

    if (this.hasNonceExpired(auditor.issuedAt)) {
      auditor = await this._auditorsService.refreshAuditor(auditor.address);
    }

    const message: string = createSIWEMessage(
      this.domain,
      this.chainId,
      _auditorAddress,
      auditor.nonce,
      auditor.issuedAt,
    );
    return { message };
  }

  async signIn(_signIn: SignInDTO): Promise<JwtDTO> {
    const { auditorAddress, signature } = _signIn;
    if (!auditorAddress || !signature) {
      throw new Error(ErrorCodes.BAD_SIGN_IN_REQUEST.code);
    }

    const auditor: Auditor =
      await this._auditorsService.findOrCreateAuditor(auditorAddress);

    const messageToCheck: string = createSIWEMessage(
      this.domain,
      this.chainId,
      auditor?.address,
      auditor?.nonce,
      auditor?.issuedAt,
    );

    const recoveredAddress = verifyMessage(messageToCheck, signature);

    if (
      !auditor ||
      recoveredAddress.toLowerCase() !== auditorAddress.toLowerCase()
    ) {
      throw new Error(ErrorCodes.UNAUTHORIZED.code);
    }

    if (this.hasNonceExpired(auditor.issuedAt)) {
      throw new Error(ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code);
    }

    await this._auditorsService.refreshAuditor(auditorAddress);
    if (auditor.isOnboardingPending) {
      await this._auditorsService.registerAuditor(auditorAddress);
    }

    const payload = { address: auditorAddress };
    const token = this._jwtService.sign(payload);

    return { accessToken: token, isNew: auditor.isOnboardingPending };
  }

  hasNonceExpired(issuedAt: string): boolean {
    return Date.now() - new Date(issuedAt).getTime() > AUTH_EXPIRATION_TIMEOUT;
  }
}
