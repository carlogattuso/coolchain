import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config/config';

export class RecordService {
  private readonly recordsFilePath: string = config.recordsDir;

  public getRecordValue(): number | null {

    if (!existsSync(this.recordsFilePath)) {
      console.error(`No records file found, scandir ${this.recordsFilePath}`);
      return null;
    }

    const sensors: string[] = readdirSync(this.recordsFilePath)
      .filter(file => file.startsWith('28-'))
      .map(file => path.join(this.recordsFilePath, file));

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

}
