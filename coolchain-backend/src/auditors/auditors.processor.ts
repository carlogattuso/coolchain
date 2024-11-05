import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Auditor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ErrorCodes } from '../utils/errors';
import { ContractTransactionReceipt } from 'ethers';

@Processor('auditor-queue')
export class AuditorsProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditorsProcessor.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _blockchainService: BlockchainService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'processRegisterAuditor':
        {
          await this.registerAuditor(job.data.auditorAddress);
        }
        break;
    }
  }

  async registerAuditor(_auditorAddress: string): Promise<any> {
    let auditorInDB: Auditor;
    try {
      auditorInDB = await this._prismaService.auditor.findUnique({
        where: { address: _auditorAddress, isOnboardingPending: true },
      });
    } catch (error) {
      this.logger.error(`Error updating nonce: ${error.message}`, {
        stack: error.stack,
        auditor: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    if (auditorInDB) {
      // Register in the contract
      try {
        const auditorResult: ContractTransactionReceipt =
          await this._blockchainService.registerAuditor({
            address: _auditorAddress,
          });
        await this._prismaService.auditor.update({
          where: { address: _auditorAddress },
          data: { isOnboardingPending: false },
        });
        return auditorResult;
      } catch (error) {
        console.error(`Error registering auditor: ${error.message}`);
        throw new Error(ErrorCodes.AUDITOR_REGISTRATION_ERROR.code);
      }
    }
  }
}
