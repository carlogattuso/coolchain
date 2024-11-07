import { CreateRecordDTO } from './types/dto/CreateRecordDTO';

export function arePermitFieldsPresent(record: CreateRecordDTO): boolean {
  return (
    record.hasOwnProperty('permitDeadline') &&
    record.hasOwnProperty('permitSignature')
  );
}
