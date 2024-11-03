import { Injectable, Logger } from '@nestjs/common';
import { ErrorCodes } from '../utils/errors';
import { DeviceDTO } from './types/dto/DeviceDTO';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceInputDTO } from './types/dto/CreateDeviceInputDTO';
import { DeviceAlreadyExistsError } from '../utils/types/DeviceAlreadyExistsError';
import { CreateDeviceOutputDTO } from './types/dto/CreateDeviceOutputDTO';
import { Device } from './types/Device';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);

  constructor(private readonly _prismaService: PrismaService) {}

  async createDevices(
    _auditorAddress: string,
    _input: CreateDeviceInputDTO,
  ): Promise<CreateDeviceOutputDTO> {
    const deviceAddresses = _input.devices.map((d) => d.address);

    let existingAddresses: string[];
    try {
      const existingDevices = await this._prismaService.device.findMany({
        where: {
          address: {
            in: deviceAddresses,
          },
        },
        select: {
          address: true,
        },
      });
      existingAddresses = existingDevices.map((device) => device.address);
    } catch (error) {
      this.logger.error(`Error retrieving devices: ${error.message}`, {
        stack: error.stack,
        devices: deviceAddresses,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }

    if (existingAddresses.length > 0) {
      throw new DeviceAlreadyExistsError(
        ErrorCodes.DEVICE_ALREADY_EXISTS.code,
        existingAddresses,
      );
    }

    try {
      const createdDevices = await this._prismaService.device.createMany({
        data: _input.devices.map((device) => ({
          auditorAddress: _auditorAddress,
          address: device.address,
          name: device.name,
        })),
      });
      return { created: createdDevices.count };
    } catch (error) {
      this.logger.error(`Error creating devices: ${error.message}`, {
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

  async findDevice(address: string): Promise<Device> {
    try {
      return await this._prismaService.device.findUnique({
        where: { address },
      });
    } catch (error) {
      this.logger.error(`Error retrieving device: ${error.message}`, {
        stack: error.stack,
        device: address,
      });
      throw new Error(ErrorCodes.DATABASE_ERROR.code);
    }
  }
}
