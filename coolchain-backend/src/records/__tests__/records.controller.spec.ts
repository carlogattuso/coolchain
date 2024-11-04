import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from '../records.controller';
import { RecordsService } from '../records.service';
import {
  BadRequestException,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../auth/auth.guard';
import { ThrottlerException } from '@nestjs/throttler';

const mockCreateRecordDTO = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: Date.now() + 24 * 60 * 60,
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

describe('RecordsController', () => {
  let recordsController: RecordsController;
  let recordsService: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            storeUnauditedRecord: jest.fn(),
            getRecordsWithEvents: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedJwtToken'),
            verify: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'mockedSecret';
              }
            }),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    recordsController = module.get<RecordsController>(RecordsController);
    recordsService = module.get<RecordsService>(RecordsService);
  });

  it('should be defined', () => {
    expect(recordsController).toBeDefined();
    expect(recordsService).toBeDefined();
  });

  describe('storeRecord', () => {
    it('should create a new record and return the created data', async () => {
      const createRecordDto: CreateRecordDTO = mockCreateRecordDTO();
      jest
        .spyOn(recordsService, 'storeUnauditedRecord')
        .mockResolvedValue(createRecordDto);

      const result = await recordsController.storeRecord(createRecordDto);
      expect(result).toBe(createRecordDto);
    });

    it('should throw ForbiddenException if device is not registered', async () => {
      const createRecordDto: CreateRecordDTO = mockCreateRecordDTO();
      jest.spyOn(recordsService, 'storeUnauditedRecord').mockRejectedValue({
        message: ErrorCodes.DEVICE_NOT_REGISTERED.code,
      });

      await expect(
        recordsController.storeRecord(createRecordDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ThrottlerException if audit is not available', async () => {
      const createRecordDto: CreateRecordDTO = mockCreateRecordDTO();
      jest.spyOn(recordsService, 'storeUnauditedRecord').mockRejectedValue({
        message: ErrorCodes.AUDIT_NOT_AVAILABLE.code,
      });

      await expect(
        recordsController.storeRecord(createRecordDto),
      ).rejects.toThrow(ThrottlerException);
    });

    it('should return BadRequestException when validation fails', async () => {
      const invalidDto = {
        deviceAddress: new Date(),
        timestamp: 'hey',
        value: 'test value',
        test: 'hi!',
        recordSignature: { v: 'abc', r: '0x123', s: '0x456' },
        permitSignature: { v: 'abc', r: '0x12a', s: '0x4b6' },
      };

      const validationPipe = new ValidationPipe();

      try {
        await validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: CreateRecordDTO,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.getResponse().message).toEqual([
          'deviceAddress must be an Ethereum address',
          'timestamp must be a positive number',
          'timestamp must be an integer number',
          'value must be a number conforming to the specified constraints',
          'permitDeadline must be a positive number',
          'permitDeadline must be an integer number',
          'permitSignature.v must be a number conforming to the specified constraints',
          'permitSignature.r must be longer than or equal to 64 characters',
          'permitSignature.s must be longer than or equal to 64 characters',
        ]);
      }
    });

    it('should throw BadRequestException for other errors', async () => {
      const createRecordDto: CreateRecordDTO = mockCreateRecordDTO();
      jest
        .spyOn(recordsService, 'storeUnauditedRecord')
        .mockRejectedValue(new Error('Other error'));

      await expect(
        recordsController.storeRecord(createRecordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRecords', () => {
    it('should return an array of records', async () => {
      const records: RecordDTO[] = [
        {
          id: '1',
          deviceAddress: 'device1',
          timestamp: 1234,
          value: 3,
          events: [
            {
              id: '1',
              transactionHash: '0x1234',
              transactionIndex: 0,
              blockHash: '0xacbd',
              blockNumber: 234,
              address: '0xa1b2',
              data: 'anoenfe',
              topics: ['0x123', '0x456'],
              index: 0,
              eventType: 'SubcallSucceeded',
              recordId: '1',
            },
          ],
        },
        {
          id: '2',
          deviceAddress: 'device2',
          timestamp: 4321,
          value: 2,
          events: [
            {
              id: '2',
              transactionHash: '0x1234',
              transactionIndex: 0,
              blockHash: '0xacbd',
              blockNumber: 234,
              address: '0xa1b2',
              data: 'anoenfe',
              topics: ['0x123', '0x456'],
              index: 1,
              eventType: 'SubcallSucceeded',
              recordId: '1',
            },
          ],
        },
      ];
      const requestMock = { auditor: { address: 'test-address' } };

      jest
        .spyOn(recordsService, 'getRecordsWithEvents')
        .mockResolvedValue(records);

      const result = await recordsController.getRecords(requestMock as any);
      expect(result).toBe(records);
      expect(recordsService.getRecordsWithEvents).toHaveBeenCalledWith(
        'test-address',
        undefined,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const requestMock = { auditor: { address: 'test-address' } };
      jest
        .spyOn(recordsService, 'getRecordsWithEvents')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        recordsController.getRecords(requestMock as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
