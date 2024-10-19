import { OmitType } from '@nestjs/swagger';
import { Device } from '../Device';

export class DeviceDTO extends OmitType(Device, ['auditorAddress'] as const) {}
