import { Record } from '@/helpers/types/Record';

export function isPermitDeadlinePresent(record: Record): boolean {
  return (
    record.hasOwnProperty('permitDeadline') && record.permitDeadline !== null
  );
}