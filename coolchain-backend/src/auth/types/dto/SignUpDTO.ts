import { OmitType } from '@nestjs/swagger';
import { Auditor } from '../Auditor';

export class SignUpDTO extends OmitType(Auditor, [
  'devices',
  'nonce',
  'issuedAt',
] as const) {}
