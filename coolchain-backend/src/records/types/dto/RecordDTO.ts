import { OmitType } from '@nestjs/swagger';
import { Record } from '../Record';

export class RecordDTO extends OmitType(Record, [
  'recordSignature',
  'permitSignature',
] as const) {}
