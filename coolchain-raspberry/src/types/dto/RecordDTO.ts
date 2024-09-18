import { ECDSASignature } from '../ECDSASignature';

export interface RecordDTO {
  deviceId: string;
  value: number;
  timestamp: number;
  recordSignature: ECDSASignature;
  permitSignature: ECDSASignature;
}
