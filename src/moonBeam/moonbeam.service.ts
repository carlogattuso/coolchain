import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ethers, TypedDataDomain } from 'ethers';

import contractFile from '../contract/compileContract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
} from '../utils/contants';

const CHAIN_NAME: string = 'moonbase-alpha';
const CHAIN_RPC_URL: string = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID: number = 1287;

@Injectable()
export class MoonbeamService {
  private readonly provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
  private wallet: ethers.Wallet;
  private readonly domain: TypedDataDomain;
  private readonly types: any;

  constructor(private configService: ConfigService) {
    this.accountFrom = {
      privateKey: this.configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = this.configService.get('CONTRACT_ADDRESS');

    // Configure Moonbeam provider based on your setup
    const providerRPC = {
      moonbase: {
        name: CHAIN_NAME,
        rpc: CHAIN_RPC_URL,
        chainId: CHAIN_ID, // 0x507 in hex,
      },
    };
    this.provider = new ethers.JsonRpcProvider(providerRPC.moonbase.rpc, {
      chainId: providerRPC.moonbase.chainId,
      name: providerRPC.moonbase.name,
    });

    this.wallet = new ethers.Wallet(this.accountFrom.privateKey, this.provider);

    //EIP712
    this.domain = {
      name: 'coolchain',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: this.contractAddress,
    };

    this.types = {
      Measurement: [
        { name: 'sensorId', type: 'uint64' },
        { name: 'value', type: 'uint8' },
        { name: 'timestamp', type: 'uint64' },
      ],
    };
  }

  async sendMeasurement(
    sensorId: number,
    timeStampDateTime: Date,
    value: number,
  ): Promise<any> {
    const measurement = {
      sensorId: sensorId,
      value: value,
      timestamp: timeStampDateTime.getTime(),
    };

    const signature: string = await this.wallet.signTypedData(
      this.domain,
      this.types,
      measurement,
    );

    const { r, s, v } = ethers.Signature.from(signature);

    const coolChainContract: ethers.Contract = new ethers.Contract(
      this.contractAddress,
      contractFile.abi,
      this.wallet,
    );

    const createReceipt = await coolChainContract.sendMeasurement(
      measurement.sensorId,
      measurement.value,
      measurement.timestamp,
      v,
      r,
      s,
    );

    createReceipt.wait();

    return createReceipt;
  }

  async callBatchPrecompileContract(data): Promise<string> {
    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const callBatch = async (
      measurementsData: Array<any>,
      numberOfRequests: number = 1,
    ): Promise<any> => {
      console.log(`Calling the batch precompiled contract`);
      const addresses = Array(numberOfRequests).fill(this.contractAddress);
      const values = Array(numberOfRequests).fill(0);
      const gasLimit = [];

      const yourContractInterface = new ethers.Interface(contractFile.abi);
      const callData = measurementsData.map((value) =>
        yourContractInterface.encodeFunctionData('sendMeasurement', [
          value.sensorId,
          value.value,
          value.timeStamp,
          value.v,
          value.r,
          value.s,
        ]),
      );

      console.log('Call batch with');
      console.log(addresses);
      console.log(values);
      console.log(callData);
      console.log(gasLimit);

      const createReceipt = await batchPrecompiled.batchAll(
        addresses,
        values,
        callData,
        gasLimit,
      );

      console.log(createReceipt);
      createReceipt.wait();
      console.log(`Tx successful with hash: ${createReceipt.hash}`);
      return createReceipt;
    };
    await callBatch(data.length, data);

    return `${callBatch}`;
  }
}
