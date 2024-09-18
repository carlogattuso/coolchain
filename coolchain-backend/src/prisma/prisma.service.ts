import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Record } from '@prisma/client';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';

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

  async getRecordsWithEvents(_deviceId: string): Promise<Record[] | null> {
    return this.record.findMany({
      where: { deviceId: _deviceId },
      include: {
        events: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
