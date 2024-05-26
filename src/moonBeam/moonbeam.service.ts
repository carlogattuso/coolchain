import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ethers, TypedDataDomain } from 'ethers';

import contractFile from '../contract/compileContract';

const CHAIN_NAME: string = 'moonbase-alpha';
const CHAIN_RPC_URL: string = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID: number = 1287;

@Injectable()
export class MoonbeamService {
  private readonly provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;
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

    //Configure Smart Contract
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

    const wallet: ethers.Wallet = new ethers.Wallet(
      this.accountFrom.privateKey,
      this.provider,
    );

    const signature: string = await wallet.signTypedData(
      this.domain,
      this.types,
      measurement,
    );

    const { r, s, v } = ethers.Signature.from(signature);

    const coolChainContract: ethers.Contract = new ethers.Contract(
      this.contractAddress,
      contractFile.abi,
      wallet,
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
}
