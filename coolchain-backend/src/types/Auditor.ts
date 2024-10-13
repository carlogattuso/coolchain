import { Device } from './Device';

export interface Auditor {
  address: string;
  devices: Device[];
}