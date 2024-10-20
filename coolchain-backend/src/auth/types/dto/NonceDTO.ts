import { OmitType } from '@nestjs/swagger';
import { SignInDTO } from './SignInDTO';

export class NonceDTO extends OmitType(SignInDTO, [
  'address',
  'signature',
] as const) {}
