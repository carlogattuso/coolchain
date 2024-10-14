import { Injectable } from '@nestjs/common';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { PrismaService } from '../prisma/prisma.service';
import { Record } from '../types/Record';
import { ErrorCodes } from '../utils/errors';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordsService {
  constructor(private _prismaService: PrismaService) {}

  async storeUnauditedRecord(
    _record: CreateRecordDTO,
  ): Promise<CreateRecordDTO> {
    const device = await this._prismaService.device.findUnique({
      where: { address: _record.deviceAddress },
    });

    if (!device) {
      throw new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code);
    }

    try {
      return this._prismaService.record.create({
        data: {
          deviceAddress: _record.deviceAddress,
          timestamp: _record.timestamp,
          value: _record.value,
          recordSignature: _record.recordSignature,
          permitSignature: _record.permitSignature,
        },
      });
    } catch (error) {
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async getUnauditedRecords(_recordNum: number): Promise<Record[]> {
    return this._prismaService.record.findMany({
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
  }

  async auditRecords(_events: CreateEventDTO[]): Promise<void> {
    await this._prismaService.event.createMany({
      data: _events,
    });
  }

  async getRecordsWithEvents(
    _deviceAddress?: string,
  ): Promise<RecordDTO[] | null> {
    const query: Prisma.RecordFindManyArgs = {
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
      query.where = { deviceAddress: _deviceAddress };
    }

    try {
      return this._prismaService.record.findMany(query);
    } catch (error) {
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }
}
