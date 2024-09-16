import { Event } from '@prisma/client';

export interface AuditResult {
  submittedRecordIds: string[];
  failedRecordIds: string[];
  events: Event[];
}
