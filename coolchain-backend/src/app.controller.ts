import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Device } from './types/Device';
import { Auditor } from './types/Auditor';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly _appService: AppService,
    private readonly _prismaService: PrismaService,
  ) {}

  @Get() getHello(): string {
    return this._appService.getHello();
  }

  @Get('/devices/')
  async getDevices(): Promise<Device[]> {
    return this._prismaService.getDevices();
  }

  @Get('/auditors/')
  async getAuditors(): Promise<Auditor[]> {
    return this._prismaService.getAuditors();
  }
}
