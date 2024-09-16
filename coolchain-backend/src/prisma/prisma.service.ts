import { Injectable, OnModuleInit } from '@nestjs/common';
import { Event, PrismaClient, Record, RecordStatus } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async storeUnauditedRecord(_userData: { deviceId: string; value: number }) {
    return this.record.create({
      data: {
        deviceId: _userData.deviceId,
        timestamp: new Date(),
        status: RecordStatus.PENDING,
        value: _userData.value,
      },
    });
  }

  async getUnauditedRecords(_recordNum: number): Promise<Record[]> {
    return this.record.findMany({
      where: {
        status: {
          equals: RecordStatus.PENDING,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: _recordNum,
    });
  }

  async auditRecords(
    _submittedRecordIds: string[],
    _failedRecordIds: string[],
    _events: Event[],
  ): Promise<void> {
    await this.$transaction(async (prisma) => {
      const updateSubmitted = prisma.record.updateMany({
        where: {
          id: {
            in: _submittedRecordIds,
          },
        },
        data: {
          status: RecordStatus.SUBMITTED,
        },
      });

      const updateFailed = await prisma.record.updateMany({
        where: {
          id: {
            in: _failedRecordIds,
          },
        },
        data: {
          status: RecordStatus.FAILED,
        },
      });

      await Promise.all([updateSubmitted, updateFailed]);

      await prisma.event.createMany({
        data: _events,
      });
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
