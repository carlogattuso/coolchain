import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { config } from '../config/config';
import axios from 'axios';
import { parseAxiosError } from '../utils/utils';
import { AuditStatusDTO } from '../types/dto/AuditStatusDTO';
import { RecordDTO } from '../types/dto/RecordDTO';

export class RecordService {
  private readonly recordsFilePath: string = config.recordsDir;
  private readonly apiEndpoint: string = `${config.coolchainUrl}/records`;

  public getRecordValue(): number | null {

    if (!existsSync(this.recordsFilePath)) {
      console.error(`No records file found, scandir ${this.recordsFilePath}`);
      return null;
    }

    const sensors: string[] = readdirSync(this.recordsFilePath)
      .filter(file => file.startsWith('28-'))
      .map(file => join(this.recordsFilePath, file));

    if (sensors.length === 0) {
      console.log(`No data from temperature sensors - Skipping record storage`);
      return null;
    }

    const total = sensors.map(sensor => {
      const rawValue = readFileSync(path.join(sensor, 'w1_slave'))
        .toString()
        .split('=')[2]?.trim() ?? '0';
      const name = path.basename(sensor);
      const parsedValue = Number(rawValue);
      console.log(`Sensor ${name}: ${(parsedValue / 1000).toFixed(2)}ºC`);
      return parsedValue;
    }).reduce((acc, current) => acc + current, 0);

    return Math.trunc(total / sensors.length);
  }

  async sendRecord(_recordWithPermit: RecordDTO) {
    const url = join(this.apiEndpoint, '/');
    try {
      await axios.post(url, _recordWithPermit, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.info('Record successfully sent to Coolchain');
    } catch (error) {
      console.error(parseAxiosError(error, url));
    }
  }

  async getAuditStatus(_deviceAddress: string): Promise<AuditStatusDTO | undefined> {
    const url = join(this.apiEndpoint, '/status');
    try {
      const response = await axios.get(url, {
        params: {
          deviceAddress: _deviceAddress,
        },
      });

      const auditStatus: AuditStatusDTO = response.data;
      console.warn(`Current audit status: ${auditStatus.isAuditPending ? 'Pending' : 'Available'}`);
      return auditStatus;
    } catch (error) {
      console.error(parseAxiosError(error, url));
    }
  }
}
