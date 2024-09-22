import { ECDSASignature } from '../ECDSASignature';

export interface RecordDTO {
  deviceAddress: string;
  value: number;
  timestamp: number;
  recordSignature: ECDSASignature;
  permitSignature: ECDSASignature;
}
