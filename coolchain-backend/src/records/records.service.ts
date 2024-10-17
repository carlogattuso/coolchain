import { Injectable, Logger } from '@nestjs/common';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { PrismaService } from '../prisma/prisma.service';
import { Record } from '../types/Record';
import { ErrorCodes } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { Device } from '../types/Device';

@Injectable()
export class RecordsService {
  private readonly logger: Logger = new Logger(RecordsService.name);

  constructor(private readonly _prismaService: PrismaService) {}

  async storeUnauditedRecord(
    _record: CreateRecordDTO,
  ): Promise<CreateRecordDTO> {
    let device: Device;
    try {
      device = await this._prismaService.device.findUnique({
        where: { address: _record.deviceAddress },
      });
    } catch (error) {
      this.logger.error(`Error retrieving device: ${error.message}`, {
        stack: error.stack,
        device: _record.deviceAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    if (!device) {
      throw new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code);
    }

    try {
      return await this._prismaService.record.create({
        data: {
          deviceAddress: _record.deviceAddress,
          timestamp: _record.timestamp,
          value: _record.value,
          recordSignature: _record.recordSignature,
          permitSignature: _record.permitSignature,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating record: ${error.message}`, {
        stack: error.stack,
        device: _record.deviceAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async getUnauditedRecords(_recordNum: number): Promise<Record[]> {
    try {
      return await this._prismaService.record.findMany({
        where: {
          events: {
            none: {},
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: _recordNum,
      });
    } catch (error) {
      this.logger.error(
        `Error retrieving unaudited records: ${error.message}`,
        {
          stack: error.stack,
        },
      );
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async auditRecords(_events: CreateEventDTO[]): Promise<void> {
    try {
      await this._prismaService.event.createMany({
        data: _events,
      });
    } catch (error) {
      this.logger.error(`Error creating events: ${error.message}`, {
        stack: error.stack,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async getRecordsWithEvents(
    _auditorAddress: string,
    _deviceAddress?: string,
  ): Promise<RecordDTO[] | null> {
    const query: Prisma.RecordFindManyArgs = {
      where: {
        device: {
          auditorAddress: _auditorAddress,
        },
      },
      select: {
        id: true,
        deviceAddress: true,
        timestamp: true,
        value: true,
        events: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    };

    if (_deviceAddress) {
      query.where.deviceAddress = _deviceAddress;
    }

    try {
      return await this._prismaService.record.findMany(query);
    } catch (error) {
      this.logger.error(
        `Error retrieving records with events: ${error.message}`,
        {
          stack: error.stack,
          auditor: _auditorAddress,
          device: _deviceAddress ?? null,
        },
      );
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }
}
