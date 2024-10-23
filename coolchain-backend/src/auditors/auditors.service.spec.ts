import { Test, TestingModule } from '@nestjs/testing';
import { AuditorsService } from './auditors.service';

describe('AuditorsService', () => {
  let service: AuditorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditorsService],
    }).compile();

    service = module.get<AuditorsService>(AuditorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
