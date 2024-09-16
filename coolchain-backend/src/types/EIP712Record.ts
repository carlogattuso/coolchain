export interface EIP712Record {
  deviceId: string;
  value: number;
  timestamp: number;
  v: 27 | 28;
  r: string;
  s: string;
}
