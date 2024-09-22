import { Record } from '@prisma/client';

export type RecordDTO = Omit<Record, 'recordSignature' | 'permitSignature'>;
