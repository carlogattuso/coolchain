import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Record } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async storeUnauditedRecord(_userData: { sensorId: string; value: number }) {
    return this.record.create({
      data: {
        sensorId: _userData.sensorId,
        timestamp: new Date(),
        txHash: '',
        value: _userData.value,
      },
    });
  }

  async getUnauditedRecords(_recordNum: number): Promise<Record[]> {
    return this.record.findMany({
      where: {
        txHash: {
          equals: '',
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: _recordNum,
    });
  }

  async auditRecords(_records: Record[], _txHash: string): Promise<void> {
    await this.record.updateMany({
      where: {
        id: {
          in: _records.map((t: Record) => t.id),
        },
      },
      data: {
        txHash: _txHash,
      },
    });
  }
}
