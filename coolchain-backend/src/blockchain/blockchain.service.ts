import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  Addressable, AddressLike,
  Contract,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  EventLog,
  Interface,
  JsonRpcProvider,
  Signature,
  TypedDataDomain,
  Wallet,
} from 'ethers';

import contractFile from './contract/compile.contract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS, PERMIT_ADDRESS,
  PERMIT_PRECOMPILE_ABI,
} from '../utils/constants';
import { EIP712Record } from './types/EIP712Record';
import { CreateEventDTO } from '../events/types/dto/CreateEventDTO';
import { Record } from '../records/types/Record';
import { EventType } from '@prisma/client';

const GAS_LIMIT = 100000;

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
  private readonly salt: string;
  private readonly chainId: number;
  private readonly chainName: string;
  private readonly chainRpcUrl: string;
  private readonly wallet: Wallet;
  private readonly domain: TypedDataDomain;
  private readonly types = {
    Record: [
      { name: 'deviceAddress', type: 'address' },
      { name: 'value', type: 'uint8' },
      { name: 'timestamp', type: 'uint64' },
    ],
  };

  constructor(private readonly _configService: ConfigService) {
    this.accountFrom = {
      privateKey: this._configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = this._configService.get<string>('CONTRACT_ADDRESS');
    this.chainName = this._configService.get<string>('CHAIN_NAME');
    this.chainRpcUrl = this._configService.get<string>('CHAIN_RPC_URL');
    this.chainId = +this._configService.get<number>('CHAIN_ID');
    this.salt = this._configService.get<string>('SALT');

    this.provider = this.createJsonRpcProvider(
      this.chainRpcUrl,
      this.chainId,
      this.chainName,
    );

    this.wallet = new Wallet(this.accountFrom.privateKey, this.provider);

    //EIP712
    this.domain = {
      name: 'coolchain',
      version: '1',
      chainId: this.chainId,
      verifyingContract: this.contractAddress,
      salt: this.salt,
    };
  }

  async auditRecordsWithPermit(
    _unsignedRecords: Record[],
  ): Promise<CreateEventDTO[]> {
    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(_unsignedRecords.length).fill(PERMIT_ADDRESS);
    const values = Array(_unsignedRecords.length).fill(0);
    const gasLimit = Array(_unsignedRecords.length).fill(GAS_LIMIT);
    const contractInterface: ethers.Interface = new ethers.Interface(
      PERMIT_PRECOMPILE_ABI,
    );

    const plainCallData = await this.mapRecordToPermitData(_unsignedRecords);

    console.log('plainCallData');
    console.log(plainCallData);

    const callData = plainCallData.map((data) => {
      return contractInterface.encodeFunctionData('dispatch', [
        data.from,
        data.to,
        data.value,
        data.data,
        data.gaslimit,
        data.deadline,
        data.v,
        data.r,
        data.s,
      ]);
    });

    console.log('addresses', addresses);
    console.log('values', values);
    console.log('callData', callData);
    console.log('gasLimit', gasLimit);

    const transaction: ContractTransactionResponse =
      await batchPrecompiled.batchSome(addresses, values, callData, gasLimit);

    const receipt: ContractTransactionReceipt = await transaction.wait();

    const recordMap = new Map<number, string>(
      _unsignedRecords.map((record, index) => [index, record.id]),
    );

    return receipt.logs.map((log: EventLog) => {
      const recordId = recordMap.get(log.index);
      return {
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
      };
    });
  }

  async auditRecords(_unsignedRecords: Record[]): Promise<CreateEventDTO[]> {
    const batchPrecompiled = new Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(_unsignedRecords.length).fill(this.contractAddress);
    const values = Array(_unsignedRecords.length).fill(0);
    const gasLimit = [];

    const eip712Data: EIP712Record[] =
      await this.mapDataToEIP712(_unsignedRecords);

    const contractInterface: Interface = new Interface(contractFile.abi);
    const callData = eip712Data.map((eip712Record: EIP712Record) =>
      contractInterface.encodeFunctionData('storeRecord', [
        eip712Record.deviceAddress,
        eip712Record.value,
        eip712Record.timestamp,
      ]),
    );

    const transaction: ContractTransactionResponse =
      await batchPrecompiled.batchSome(addresses, values, callData, gasLimit);

    const receipt: ContractTransactionReceipt = await transaction.wait();

    const recordMap = new Map<number, string>(
      _unsignedRecords.map((record, index) => [index, record.id]),
    );

    return receipt.logs.map((log: EventLog) => {
      const recordId = recordMap.get(log.index);
      return {
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
      };
    });
  }

  private createJsonRpcProvider(
    _rpcUrl: string,
    _chainId?: number,
    _chainName?: string,
  ): JsonRpcProvider {
    if (_chainId && _chainName) {
      return new JsonRpcProvider(_rpcUrl, {
        chainId: _chainId,
        name: _chainName,
      });
    } else {
      return new JsonRpcProvider(_rpcUrl);
    }
  }

  private async signRecord(_record: Record): Promise<EIP712Record> {
    const dataToSign = {
      deviceAddress: _record.deviceAddress,
      value: _record.value,
      timestamp: _record.timestamp,
    };

    const signature = await this.wallet.signTypedData(
      this.domain,
      this.types,
      dataToSign,
    );
    const { r, s, v } = Signature.from(signature);

    return {
      deviceAddress: dataToSign.deviceAddress,
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

  private async mapRecordToPermitData(records: Record[]): Promise<
    Awaited<{
      gaslimit: number;
      data: string;
      from: string | Promise<string> | Addressable;
      to: string | Promise<string> | Addressable;
      deadline: number;
      value: number;
      v: number;
      r: string;
      s: string;
    }>[]
  > {
    return Promise.all(
      records.map((record: Record) => this.createPermitMessageData(record)),
    );
  }

  private async createPermitMessageData(_record: Record) {
    const from: AddressLike = _record.deviceAddress as AddressLike;
    const to: AddressLike = this.contractAddress as AddressLike;
    const value = 0;
    const gasLimit = GAS_LIMIT;
    const deadline = Math.floor(
      new Date(Date.UTC(2024, 12, 31, 23, 59, 59, 999)).getTime() / 1000,
    );
    const eip712Record: EIP712Record = await this.signRecord(_record);
    // Permit signature
    const { v, r, s } = { ..._record.permitSignature };

    const contractInterface: ethers.Interface = new ethers.Interface(
      contractFile.abi,
    );

    const recordCallData = contractInterface.encodeFunctionData('storeRecord', [
      eip712Record.deviceAddress,
      eip712Record.value,
      eip712Record.timestamp,
    ]);

    const message = {
      from,
      to,
      value,
      data: recordCallData,
      gaslimit: gasLimit,
      deadline,
      r,
      s,
      v,
    };

    return { ...message };
  }
}
