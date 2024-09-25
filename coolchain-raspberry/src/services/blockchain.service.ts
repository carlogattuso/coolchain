import { Signature, TypedDataDomain, Wallet } from 'ethers';
import { config } from '../config/config';
import { RecordDTO } from '../types/dto/RecordDTO';
import { getJsonRpcProvider, parseAxiosError } from '../utils/utils';
import { ECDSASignature } from '../types/ECDSASignature';
import { Record } from '../types/dto/Record';
import axios from 'axios';

export class BlockchainService {
  private readonly wallet: Wallet;
  private readonly domain: TypedDataDomain;
  private readonly types = {
    Record: [
      { name: 'deviceAddress', type: 'address' },
      { name: 'value', type: 'uint8' },
      { name: 'timestamp', type: 'uint64' },
    ],
  };

  constructor() {
    this.wallet = new Wallet(config.privateKey, getJsonRpcProvider());

    // EIP712 domain configuration
    this.domain = {
      name: 'coolchain',
      version: '1',
      chainId: config.chainId,
      verifyingContract: config.contractAddress,
      salt: config.salt,
    };
  }

  public async storeRecord() {
    const mockValue: number = Math.floor(Math.random() * 11);
    const record: Record = {
      deviceAddress: this.wallet.address,
      value: mockValue,
      timestamp: Math.floor(Date.now() / 1000),
    };

    const signedRecord: RecordDTO = await this.signRecord(record);

    try {
      const response = await axios.post(`${process.env.COOLCHAIN_URL}/`, signedRecord, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error(parseAxiosError(error));
    }
  }

  private async signRecord(_record: Record): Promise<RecordDTO> {
    const signature = await this.wallet.signTypedData(this.domain, this.types, _record);
    const recordSignature: ECDSASignature = Signature.from(signature);

    //TODO: Generate call permit signature

    return {
      ..._record,
      recordSignature: {
        v: recordSignature.v,
        r: recordSignature.r,
        s: recordSignature.s,
      },
      //TODO: change record signature by permit signature
      permitSignature: {
        v: recordSignature.v,
        r: recordSignature.r,
        s: recordSignature.s,
      },
    };
  }
}
