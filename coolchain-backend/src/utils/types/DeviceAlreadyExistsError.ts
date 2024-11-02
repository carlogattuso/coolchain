export class DeviceAlreadyExistsError extends Error {
  code: string;
  addresses: string[];

  constructor(code: string, addresses: string[]) {
    super(`The following addresses already exist: ${addresses.join(', ')}`);
    this.code = code;
    this.addresses = addresses;

    Object.setPrototypeOf(this, DeviceAlreadyExistsError.prototype);
  }
}
