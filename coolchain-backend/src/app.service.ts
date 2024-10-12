import { Injectable } from '@nestjs/common';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MoonbeamService } from './moonBeam/moonbeam.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event, Record } from '@prisma/client';
import { CreateEventDTO } from './types/dto/CreateEventDTO';
import { CreateRecordDTO } from './types/dto/CreateRecordDTO';
import { RecordDTO } from './types/dto/RecordDTO';
import { Device } from './types/Device';
import { Auditor } from './types/Auditor';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Coolchain!';
  }
}
