import { OmitType } from '@nestjs/swagger';
import { Record } from '../Record';

export class CreateRecordDTO extends OmitType(Record, [
  'id',
  'events',
] as const) {}
