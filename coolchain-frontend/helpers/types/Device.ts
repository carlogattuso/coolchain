export interface Device {
  address: string;
  name: string;
}

export function isDevice(obj: any): obj is Device {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.address === 'string' &&
    typeof obj.name === 'string'
  );
}