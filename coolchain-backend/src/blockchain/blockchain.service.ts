import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  AddressLike,
  Contract,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  EventLog,
  Interface,
  isAddress,
  JsonRpcProvider,
  Signature,
  Wallet,
} from 'ethers';
import {
  AUDIT_SAFETY_OFFSET,
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
  DEFAULT_SOLIDITY_ERROR_ABI,
  PERMIT_PRECOMPILE_ABI,
  PERMIT_PRECOMPILE_ADDRESS,
  PERMIT_PRECOMPILE_GAS_LIMIT,
} from '../utils/constants';
import { CreateEventDTO } from '../events/types/dto/CreateEventDTO';
import { Record } from '../records/types/Record';
import {
  createJsonRpcProvider,
  getCoolchainContract,
  getUnixTimeInSeconds,
} from './blockchain.utils';
import { RegisterAuditorDTO } from '../auditors/types/dto/RegisterAuditorDTO';
import { EventType } from '@prisma/client';

@Injectable()
export class BlockchainService {
  private readonly logger: Logger = new Logger(BlockchainService.name);
  private readonly provider: JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
  private readonly contract: Contract;
  private readonly permitPrecompileInterface = new Interface(
    PERMIT_PRECOMPILE_ABI,
  );
  private readonly chainId: number;
  private readonly chainName: string;
  private readonly chainRpcUrl: string;
  private readonly wallet: Wallet;

  constructor(private readonly _configService: ConfigService) {
    this.accountFrom = {
      privateKey: this._configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = this._configService.get<string>('CONTRACT_ADDRESS');
    this.chainName = this._configService.get<string>('CHAIN_NAME');
    this.chainRpcUrl = this._configService.get<string>('CHAIN_RPC_URL');
    this.chainId = +this._configService.get<number>('CHAIN_ID');

    this.provider = createJsonRpcProvider(
      this.chainRpcUrl,
      this.chainId,
      this.chainName,
    );

    this.wallet = new Wallet(this.accountFrom.privateKey, this.provider);

    this.contract = new Contract(
      this.contractAddress,
      getCoolchainContract().abi,
      this.wallet,
    );
  }

  async auditRecords(
    _unsignedRecords: Record[],
  ): Promise<CreateEventDTO[] | null> {
    const batchPrecompiled = new Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(_unsignedRecords.length).fill(
      PERMIT_PRECOMPILE_ADDRESS,
    );
    const values = Array(_unsignedRecords.length).fill(0);
    const gasLimit = [];

    const callData = await this.mapRecordsToPermitCallData(_unsignedRecords);
    const recordMap = new Map<number, string>(
      _unsignedRecords.map((record, index) => [index, record.id]),
    );

    let transaction: ContractTransactionResponse;
    try {
      transaction = await batchPrecompiled.batchSome(
        addresses,
        values,
        callData,
        gasLimit,
      );

      const receipt: ContractTransactionReceipt = await transaction.wait();
      return receipt.logs.map((rawEvent: EventLog) => {
        return {
          transactionHash: rawEvent.transactionHash,
          blockHash: rawEvent.blockHash,
          blockNumber: rawEvent.blockNumber,
          address: rawEvent.address,
          data: rawEvent.data,
          topics: [...rawEvent.topics],
          index: rawEvent.index,
          transactionIndex: rawEvent.transactionIndex,
          eventType: rawEvent.fragment.name as EventType,
          recordId: recordMap.get(Number(rawEvent.args)),
        };
      });
    } catch (error) {
      const errorInterface = new Interface(DEFAULT_SOLIDITY_ERROR_ABI);
      this.logger.error(
        `Some error encountered while auditing: ${error.reason}`,
        {
          detail: errorInterface.parseError(error.data),
        },
      );
      return null;
    }
  }

  async registerAuditor(
    _auditor: RegisterAuditorDTO,
  ): Promise<ContractTransactionReceipt> {
    const transaction: ContractTransactionResponse =
      await this.contract.registerAuditor(_auditor.address);
    return await transaction.wait();
  }

  async registerDevice(
    _auditorAddress: AddressLike,
    _deviceAddress: AddressLike,
  ): Promise<ContractTransactionReceipt> {
    const transaction: ContractTransactionResponse =
      await this.contract.registerDevice(_auditorAddress, _deviceAddress);
    return await transaction.wait();
  }

  async checkDevice(_deviceAddress: AddressLike): Promise<boolean> {
    const transactionResult: AddressLike =
      await this.contract.getDevice(_deviceAddress);
    return isAddress(transactionResult);
  }

  async isAuditStillPending(_record: Partial<Record>): Promise<boolean> {
    const event = _record.events.at(-1);
    const block = await this.provider.getBlock(event.blockNumber);
    return getUnixTimeInSeconds() < AUDIT_SAFETY_OFFSET + block.timestamp;
  }

  private async mapRecordsToPermitCallData(
    _records: Record[],
  ): Promise<Awaited<string>[]> {
    return Promise.all(
      _records.map((record: Record) => this.createPermitCallData(record)),
    );
  }

  private async createPermitCallData(_record: Record) {
    const from: AddressLike = _record.deviceAddress as AddressLike;
    const to: AddressLike = this.contractAddress as AddressLike;
    const value = 0;
    const gasLimit = PERMIT_PRECOMPILE_GAS_LIMIT;

    const { v, r, s } = Signature.from(_record.permitSignature);

    const recordCallData = this.contract.interface.encodeFunctionData(
      'storeRecord',
      [_record.deviceAddress, _record.value, _record.timestamp],
    );

    return this.permitPrecompileInterface.encodeFunctionData('dispatch', [
      from,
      to,
      value,
      recordCallData,
      gasLimit,
      _record.permitDeadline,
      v,
      r,
      s,
    ]);
  }
}
