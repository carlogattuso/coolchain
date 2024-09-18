import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Record } from '@prisma/client';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async storeUnauditedRecord(_record: CreateRecordDTO) {
    return this.record.create({
      data: {
        deviceId: _record.deviceId,
        timestamp: _record.timestamp,
        value: _record.value,
        recordSignature: _record.recordSignature,
        permitSignature: _record.permitSignature,
      },
    });
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

  async getRecordsWithEvents(_deviceId: string): Promise<RecordDTO[] | null> {
    return this.record.findMany({
      where: { deviceId: _deviceId },
      select: {
        id: true,
        deviceId: true,
        timestamp: true,
        value: true,
        events: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
