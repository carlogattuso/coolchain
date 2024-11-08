import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { arePermitFieldsPresent } from '../records.utils';
import { ECDSASignature } from '../types/ECDSASignature';

const mockRecord = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: Date.now() / 1000,
  value: 0,
});

describe('arePermitFieldsPresent', () => {
  it('should return true when both permitDeadline and permitSignature are present', () => {
    const record = {
      ...mockRecord(),
      permitDeadline: 1234,
      permitSignature: new ECDSASignature(),
    };
    expect(arePermitFieldsPresent(record)).toBe(true);
  });

  it('should return false when permitDeadline is missing', () => {
    const record: Partial<CreateRecordDTO> = {
      ...mockRecord(),
      permitSignature: new ECDSASignature(),
    };
    expect(arePermitFieldsPresent(record as CreateRecordDTO)).toBe(false);
  });

  it('should return false when permitSignature is missing', () => {
    const record: Partial<CreateRecordDTO> = {
      ...mockRecord(),
      permitDeadline: 1234,
    };
    expect(arePermitFieldsPresent(record as CreateRecordDTO)).toBe(false);
  });

  it('should return false when both permitDeadline and permitSignature are missing', () => {
    const record: Partial<CreateRecordDTO> = mockRecord();
    expect(arePermitFieldsPresent(record as CreateRecordDTO)).toBe(false);
  });
});
