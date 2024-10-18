import { Injectable, Logger } from '@nestjs/common';
import { ErrorCodes } from '../utils/errors';
import { DeviceDTO } from '../types/dto/DeviceDTO';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDTO } from '../types/dto/CreateDeviceDTO';
import { Device } from '../types/Device';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);

  constructor(private readonly _prismaService: PrismaService) {}

  async createDevice(
    _auditorAddress: string,
    _device: CreateDeviceDTO,
  ): Promise<CreateDeviceDTO> {
    let existingDevice: Device;
    try {
      existingDevice = await this._prismaService.device.findUnique({
        where: { address: _device.address },
      });
    } catch (error) {
      this.logger.error(`Error retrieving device: ${error.message}`, {
        stack: error.stack,
        device: _device.address,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    if (existingDevice) {
      throw new Error(ErrorCodes.DEVICE_ALREADY_EXISTS.code);
    }

    try {
      return await this._prismaService.device.create({
        data: {
          auditorAddress: _auditorAddress,
          address: _device.address,
          name: _device.name,
        },
        select: {
          address: true,
          name: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating device: ${error.message}`, {
        stack: error.stack,
        auditor: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }

  async getDevices(_auditorAddress: string): Promise<DeviceDTO[] | null> {
    try {
      return await this._prismaService.device.findMany({
        where: {
          auditorAddress: _auditorAddress,
        },
        select: {
          address: true,
          name: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error retrieving devices: ${error.message}`, {
        stack: error.stack,
        auditor: _auditorAddress,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }
}
