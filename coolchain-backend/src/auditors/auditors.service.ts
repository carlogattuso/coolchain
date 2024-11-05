import { Injectable, Logger } from '@nestjs/common';
import { ErrorCodes } from '../utils/errors';
import { Nonce } from '../auth/types/Nonce';
import { hexlify, randomBytes } from 'ethers';
import { Auditor } from './types/Auditor';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuditorsService {
  private readonly logger: Logger = new Logger(AuditorsService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _blockchainService: BlockchainService,
    @InjectQueue('auditor-queue') private auditorQueue: Queue,
  ) {}

  async refreshAuditor(_auditorAddress: string): Promise<Auditor> {
    try {
      return await this._prismaService.auditor.update({
        where: { address: _auditorAddress },
        data: await this.generateNonce(),
      });
    } catch (error) {
      this.logger.error(`Error updating nonce: ${error.message}`, {
        stack: error.stack,
        auditor: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async generateNonce(): Promise<Nonce> {
    return {
      nonce: hexlify(randomBytes(32)),
      issuedAt: new Date().toISOString(),
    };
  }

  async findOrCreateAuditor(_auditorAddress: string): Promise<Auditor> {
    try {
      const auditor = await this._prismaService.auditor.findUnique({
        where: { address: _auditorAddress },
      });

      if (auditor) {
        return auditor;
      }

      // Create auditor
      const newNonce: Nonce = await this.generateNonce();
      return await this._prismaService.auditor.create({
        data: {
          address: _auditorAddress,
          ...newNonce,
          isOnboardingPending: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error finding or creating auditor: ${error.message}`, {
        stack: error.stack,
        auditor: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async registerAuditor(_auditorAddress: string): Promise<void> {
    await this.auditorQueue.add('processRegisterAuditor', {
      auditorAddress: _auditorAddress,
    });
  }
}
