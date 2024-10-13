import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient, Record } from '@prisma/client';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { Device } from '../types/Device';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async storeUnauditedRecord(_record: CreateRecordDTO) {
    const device = await this.device.findUnique({
      where: { address: _record.deviceAddress },
    });

    if (!device) {
      throw new Error(`Device ${_record.deviceAddress} is not registered.`);
    }

    try {
      return this.record.create({
        data: {
          deviceAddress: _record.deviceAddress,
          timestamp: _record.timestamp,
          value: _record.value,
          recordSignature: _record.recordSignature,
          permitSignature: _record.permitSignature,
        },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async getUnauditedRecords(_recordNum: number): Promise<Record[]> {
    return this.record.findMany({
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
    await this.event.createMany({
      data: _events,
    });
  }

  async getRecordsWithEvents(
    _deviceAddress: string | null,
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
      query['where'] = { deviceAddress: _deviceAddress };
    }

    try {
      return await this.record.findMany(query);
    } catch (error) {
      // Log the error and rethrow or return an empty array
      console.error('Error fetching records with events:', error);
      throw new Error('Could not fetch records with events');
    }
  }

  async getDevices(): Promise<Device[] | null> {
    return this.device.findMany({
      select: {
        address: true,
        name: true,
        auditorAddress: true,
      },
      orderBy: {
        address: 'desc',
      },
    });
  }
}
