import { isEvent } from '@/helpers/types/Event';

export enum Status {
  Pending = "Pending",
  Registered = "Registered"
}

export interface Record {
  timestamp: number;
  value: number;
  deviceAddress: string;
  status?: Status;
  id: string;
  events: Event[];
}

export function isRecord(obj: any): obj is Record {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.timestamp === 'number' &&
    typeof obj.value === 'number' &&
    typeof obj.id === 'string' &&
    typeof obj.deviceAddress === 'string' &&
    ((obj.events && ((obj.events.length > 0 && isEvent(obj.events[0]))) || obj.events.length === 0) || !obj.events)
  );
}