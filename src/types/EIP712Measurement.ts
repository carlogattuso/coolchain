export interface EIP712Measurement {
  sensorId: string;
  value: number;
  timestamp: Date;
  v: 27 | 28;
  r: string;
  s: string;
}
