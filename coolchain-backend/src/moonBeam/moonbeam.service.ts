import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
  EventLog,
  TypedDataDomain,
} from 'ethers';

import contractFile from '../contract/compileContract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
} from '../utils/constants';
import { EventType, Record } from '@prisma/client';
import { EIP712Record } from '../types/EIP712Record';
import { AuditResult } from '../types/AuditResult';

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
      { name: 'deviceId', type: 'bytes32' },
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

  async auditRecords(_unsignedRecords: Record[]): Promise<AuditResult> {
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
        eip712Record.deviceId,
        eip712Record.value,
        eip712Record.timestamp,
        eip712Record.v,
        eip712Record.r,
        eip712Record.s,
      ]),
    );

    const transaction: ContractTransactionResponse =
      await batchPrecompiled.batchSome(addresses, values, callData, gasLimit);

    const receipt: ContractTransactionReceipt = await transaction.wait();

    const recordMap = new Map<number, string>(
      _unsignedRecords.map((record, index) => [index, record.id]),
    );

    const submittedRecordIds: string[] = [];
    const failedRecordIds: string[] = [];
    const events = [];

    receipt.logs.forEach((log: EventLog) => {
      const recordId = recordMap.get(log.index);
      if (log.fragment.name === EventType.SubcallSucceeded) {
        submittedRecordIds.push(recordId);
      } else {
        failedRecordIds.push(recordId);
      }

      events.push({
        transactionHash: log.transactionHash,
        blockHash: log.blockHash,
        blockNumber: log.blockNumber,
        address: log.address,
        data: log.data,
        topics: [...log.topics],
        index: log.index,
        transactionIndex: log.transactionIndex,
        eventType: log.fragment.name as EventType,
        recordId: recordId,
      });
    });

    return {
      submittedRecordIds,
      failedRecordIds,
      events,
    };
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
      deviceId: ethers.toBeHex(_record.deviceId, 32),
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
      deviceId: dataToSign.deviceId,
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
