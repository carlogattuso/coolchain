import { OmitType } from '@nestjs/swagger';
import { Event } from '../Event';

export class CreateEventDTO extends OmitType(Event, ['id'] as const) {}
