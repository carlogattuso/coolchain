import { ethers, TypedDataDomain } from 'ethers';
import { config } from '../config/config';
import { RecordDTO } from '../types/dto/RecordDTO';
import axios from 'axios';
import { getJsonRpcProvider } from '../utils/utils';
import { ECDSASignature } from '../types/ECDSASignature';
import { Record } from '../types/dto/Record';

export class BlockchainService {
  private readonly wallet: ethers.Wallet;
  private readonly domain: TypedDataDomain;
  private readonly types = {
    Record: [
      { name: 'deviceId', type: 'bytes32' },
      { name: 'value', type: 'uint8' },
      { name: 'timestamp', type: 'uint64' },
    ],
  };

  constructor() {
    this.wallet = new ethers.Wallet(config.privateKey, getJsonRpcProvider());

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
      deviceId: ethers.toBeHex(this.wallet.address, 32),
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
      if (axios.isAxiosError(error)) {
        console.error(`Request error: ${error.response?.status} - ${error.message}`);
      } else {
        console.error(`Unknown error: ${error}`);
      }
    }
  }

  private async signRecord(_record: Record): Promise<RecordDTO> {
    const signature = await this.wallet.signTypedData(this.domain, this.types, _record);
    const recordSignature: ECDSASignature = ethers.Signature.from(signature);

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
