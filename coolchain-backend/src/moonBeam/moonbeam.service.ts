import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ContractTransactionResponse, ethers, TypedDataDomain } from 'ethers';

import contractFile from '../contract/compileContract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
} from '../utils/constants';
import { Record } from '@prisma/client';
import { EIP712Record } from '../types/EIP712Record';

@Injectable()
export class MoonbeamService {
  private readonly provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
  private readonly salt: string;
  private readonly chainId: number;
  private readonly chainName: string;
  private readonly chainRpcUrl: string;
  private readonly wallet: ethers.Wallet;
  private readonly domain: TypedDataDomain;
  private readonly types = {
    Record: [
      { name: 'sensorId', type: 'bytes32' },
      { name: 'value', type: 'uint8' },
      { name: 'timestamp', type: 'uint64' },
    ],
  };

  constructor(private _configService: ConfigService) {
    this.accountFrom = {
      privateKey: this._configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = this._configService.get<string>('CONTRACT_ADDRESS');
    this.chainName = this._configService.get<string>('CHAIN_NAME');
    this.chainRpcUrl = this._configService.get<string>('CHAIN_RPC_URL');
    this.chainId = this._configService.get<number>('CHAIN_ID');
    this.salt = this._configService.get<string>('SALT');

    this.provider = this.createJsonRpcProvider(
      this.chainRpcUrl,
      this.chainId,
      this.chainName,
    );

    this.wallet = new ethers.Wallet(this.accountFrom.privateKey, this.provider);

    //EIP712
    this.domain = {
      name: 'coolchain',
      version: '1',
      chainId: this.chainId,
      verifyingContract: this.contractAddress,
      salt: this.salt,
    };
  }

  async auditRecords(
    _unsignedRecords: Array<Record>,
  ): Promise<ContractTransactionResponse> {
    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(_unsignedRecords.length).fill(this.contractAddress);
    const values = Array(_unsignedRecords.length).fill(0);
    const gasLimit = [];

    const eip712Data: EIP712Record[] =
      await this.mapDataToEIP712(_unsignedRecords);

    const contractInterface: ethers.Interface = new ethers.Interface(
      contractFile.abi,
    );
    const callData = eip712Data.map((eip712Record: EIP712Record) =>
      contractInterface.encodeFunctionData('storeRecord', [
        eip712Record.sensorId,
        eip712Record.value,
        eip712Record.timestamp,
        eip712Record.v,
        eip712Record.r,
        eip712Record.s,
      ]),
    );

    const transaction: ContractTransactionResponse =
      await batchPrecompiled.batchAll(addresses, values, callData, gasLimit);

    await transaction.wait();

    return transaction;
  }

  private createJsonRpcProvider(
    _rpcUrl: string,
    _chainId?: number,
    _chainName?: string,
  ): ethers.JsonRpcProvider {
    if (_chainId && _chainName) {
      return new ethers.JsonRpcProvider(_rpcUrl, {
        chainId: _chainId,
        name: _chainName,
      });
    } else {
      return new ethers.JsonRpcProvider(_rpcUrl);
    }
  }

  private async signRecord(_record: Record): Promise<EIP712Record> {
    const dataToSign = {
      sensorId: ethers.toBeHex(_record.sensorId, 32),
      value: _record.value,
      timestamp: Math.floor(_record.timestamp.getTime() / 1000),
    };

    const signature = await this.wallet.signTypedData(
      this.domain,
      this.types,
      dataToSign,
    );
    const { r, s, v } = ethers.Signature.from(signature);

    return {
      sensorId: dataToSign.sensorId,
      value: dataToSign.value,
      timestamp: dataToSign.timestamp,
      v: v,
      r: r,
      s: s,
    };
  }

  private async mapDataToEIP712(_data: Record[]): Promise<EIP712Record[]> {
    return Promise.all(_data.map((record: Record) => this.signRecord(record)));
  }
}
