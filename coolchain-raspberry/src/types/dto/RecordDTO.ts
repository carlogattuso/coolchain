import { ECDSASignature } from '../ECDSASignature';

export interface RecordDTO {
  deviceAddress: string;
  value: number;
  timestamp: number;
  permitDeadline?: number;
  permitSignature?: ECDSASignature;
}
