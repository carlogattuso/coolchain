import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ContractTransactionResponse, ethers, TypedDataDomain } from 'ethers';

import contractFile from '../contract/compileContract';
import {
  BATCH_PRECOMPILE_ABI,
  BATCH_PRECOMPILE_ADDRESS,
} from '../utils/constants';
import { Measurement } from '@prisma/client';
import { EIP712Measurement } from '../types/EIP712Measurement';

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
    Measurement: [
      { name: 'sensorId', type: 'bytes32' },
      { name: 'value', type: 'uint8' },
      { name: 'timestamp', type: 'uint64' },
    ],
  };

  constructor(private configService: ConfigService) {
    this.accountFrom = {
      privateKey: this.configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    this.chainName = this.configService.get<string>('CHAIN_NAME');
    this.chainRpcUrl = this.configService.get<string>('CHAIN_RPC_URL');
    this.chainId = this.configService.get<number>('CHAIN_ID');
    this.salt = this.configService.get<string>('SALT');

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

  async verifyMeasurements(
    unsignedMeasurements: Array<Measurement>,
  ): Promise<ContractTransactionResponse> {
    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const addresses = Array(unsignedMeasurements.length).fill(
      this.contractAddress,
    );
    const values = Array(unsignedMeasurements.length).fill(0);
    const gasLimit = [];

    const eip712Data: EIP712Measurement[] =
      await this.mapDataToEIP712(unsignedMeasurements);

    const contractInterface: ethers.Interface = new ethers.Interface(
      contractFile.abi,
    );
    const callData = eip712Data.map((eip712Measurement: EIP712Measurement) =>
      contractInterface.encodeFunctionData('storeMeasurement', [
        eip712Measurement.sensorId,
        eip712Measurement.value,
        eip712Measurement.timestamp,
        eip712Measurement.v,
        eip712Measurement.r,
        eip712Measurement.s,
      ]),
    );

    const transaction: ContractTransactionResponse =
      await batchPrecompiled.batchAll(addresses, values, callData, gasLimit);

    await transaction.wait();

    return transaction;
  }

  private createJsonRpcProvider(
    rpcUrl: string,
    chainId?: number,
    chainName?: string,
  ): ethers.JsonRpcProvider {
    if (chainId && chainName) {
      return new ethers.JsonRpcProvider(rpcUrl, {
        chainId: chainId,
        name: chainName,
      });
    } else {
      return new ethers.JsonRpcProvider(rpcUrl);
    }
  }

  private async signMeasurement(
    measurement: Measurement,
  ): Promise<EIP712Measurement> {
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
  }

  private async mapDataToEIP712(
    data: Measurement[],
  ): Promise<EIP712Measurement[]> {
    return Promise.all(
      data.map((measurement: Measurement) => this.signMeasurement(measurement)),
    );
  }
}
