import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ErrorCodes } from '../utils/errors';
import { ContractTransactionReceipt } from 'ethers';
import { Device } from './types/Device';

@Processor('devices-queue')
export class DevicesProcessor extends WorkerHost {
  private readonly logger = new Logger(DevicesProcessor.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _blockchainService: BlockchainService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'processRegisterDevice':
        {
          this.logger.log('Process device registration');
          await this.registerDevice(
            job.data.auditorAddress,
            job.data.deviceAddress,
          );
        }
        break;
    }
  }

  async registerDevice(
    _auditorAddress: string,
    _deviceAddress: string,
  ): Promise<any> {
    let deviceInDB: Device;
    try {
      deviceInDB = await this._prismaService.device.findUnique({
        where: { address: _deviceAddress, auditorAddress: _auditorAddress },
      });
    } catch (error) {
      this.logger.error(`Error finding device: ${error.message}`, {
        stack: error.stack,
        device: _deviceAddress,
        auditorAddress: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    if (deviceInDB) {
      // Register in the contract
      try {
        const deviceResult: ContractTransactionReceipt =
          await this._blockchainService.registerDevice(
            deviceInDB.auditorAddress,
            deviceInDB.address,
          );
        this.logger.log('Successfully registered device ', _deviceAddress);
        return deviceResult;
      } catch (error) {
        this.logger.error(`Error registering device: ${error.message}`);
        throw new Error(ErrorCodes.DEVICE_REGISTRATION_ERROR.code);
      }
    }
  }
}
