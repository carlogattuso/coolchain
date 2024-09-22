import { Record } from '@prisma/client';

export type CreateRecordDTO = Omit<Record, 'id' | 'events'>;
