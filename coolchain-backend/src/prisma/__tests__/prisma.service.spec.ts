import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database on module init', async () => {
    const connectSpy = jest
      .spyOn(PrismaClient.prototype, '$connect')
      .mockResolvedValue(undefined);
    await prismaService.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });
});
