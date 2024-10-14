import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Device } from '../types/Device';
import { Auditor } from '../types/Auditor';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
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

  async getAuditors(): Promise<Auditor[] | null> {
    return this.auditor.findMany({
      select: {
        address: true,
        devices: true,
      },
      orderBy: {
        address: 'desc',
      },
    });
  }
}
