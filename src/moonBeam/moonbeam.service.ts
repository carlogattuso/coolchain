import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ethers, TypedDataDomain } from 'ethers';

import contractFile from '../contract/compileContract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
} from '../utils/constants';

const CHAIN_NAME: string = 'moonbase-alpha';
const CHAIN_RPC_URL: string = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID: number = 1287;

@Injectable()
export class MoonbeamService {
  private readonly provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
  private readonly wallet: ethers.Wallet;
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
      salt: '0x5e75394f31cc39406c2d33d400bb0a9d15ede58611e895e36e6642881aa1cae6',
    };

    this.types = {
      Measurement: [
        { name: 'sensorId', type: 'uint64' },
        { name: 'value', type: 'uint8' },
        { name: 'timestamp', type: 'uint64' },
      ],
    };
  }

  async sendMeasurement(data: Array<any>): Promise<any> {
    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(data.length).fill(this.contractAddress);
    const values = Array(data.length).fill(0);
    const gasLimit = [];

    const dataToSend: Array<any> = data.map(async (measurement) => {
      const signature = await this.wallet.signTypedData(
        this.domain,
        this.types,
        measurement,
      );

      const { r, s, v } = ethers.Signature.from(signature);

      return {
        sensorId: measurement.sensorId,
        value: measurement.value,
        timestamp: measurement.timestamp,
        v: v,
        r: r,
        s: s,
      };
    });

    const resolvedValues = await Promise.all(dataToSend);

    const yourContractInterface = new ethers.Interface(contractFile.abi);
    const callData = resolvedValues.map((value) =>
      yourContractInterface.encodeFunctionData('sendMeasurement', [
        value.sensorId,
        value.value,
        value.timestamp,
        value.v,
        value.r,
        value.s,
      ]),
    );

    const createReceipt = await batchPrecompiled.batchAll(
      addresses,
      values,
      callData,
      gasLimit,
    );

    createReceipt.wait();

    return createReceipt;
  }

  async callBatchPrecompileContract(data: any): Promise<string> {
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
