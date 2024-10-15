export class SignInMessage {
  address: string;
  nonce: string;
  action: string;
  timestamp: number;
  message: string;

  constructor(
    address: string,
    nonce: string,
    action: string,
    timestamp: number,
  ) {
    this.address = address;
    this.nonce = nonce;
    this.action = action;
    this.timestamp = timestamp;
    this.message =
      'Sign this message to authenticate. This signature will not incur any gas fees or perform transactions.';
  }

  public toJSON(): string {
    return JSON.stringify({
      action: this.action,
      address: this.address,
      nonce: this.nonce,
      timestamp: this.timestamp,
      message: this.message,
    });
  }
}
