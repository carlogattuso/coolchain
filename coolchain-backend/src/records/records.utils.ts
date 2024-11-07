import { CreateRecordDTO } from './types/dto/CreateRecordDTO';

export function isPermitFieldsPresent(record: CreateRecordDTO): boolean {
  return (
    record.hasOwnProperty('permitDeadline') &&
    record.hasOwnProperty('permitSignature')
  );
}
