import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDTO } from './types/dto/CreateEventDTO';
import { ErrorCodes } from '../utils/errors';
import { PrismaService } from '../prisma/prisma.service';
import { RecordsService } from '../records/records.service';

@Injectable()
export class EventsService {
  private readonly logger: Logger = new Logger(RecordsService.name);

  constructor(private readonly _prismaService: PrismaService) {}

  async storeEvents(_events: CreateEventDTO[]): Promise<void> {
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
}
