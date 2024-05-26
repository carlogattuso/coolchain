import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import contractFile from '../contract/compileContract';

const CHAIN_NAME: string = 'moonbase-alpha';
const CHAIN_RPC_URL: string = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID: number = 1287;

@Injectable()
export class MoonbeamService {
  private readonly provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: string };
  private readonly contractAddress: string;

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
  }

  async sendMeasurement(
    sensorId: number,
    timeStampDateTime: Date,
    value: number,
  ): Promise<any> {
    const measurement = {
      sensorId,
      timeStamp: timeStampDateTime.getTime(),
      value,
      v: 0,
      r: '0x7465737400000000000000000000000000000000000000000000000000000000',
      s: '0x7465737400000000000000000000000000000000000000000000000000000000',
    };

    const wallet = new ethers.Wallet(
      this.accountFrom.privateKey,
      this.provider,
    );

    const coolChainContract = new ethers.Contract(
      this.contractAddress,
      contractFile.abi,
      wallet,
    );

    const createReceipt = await coolChainContract.sendMeasurement(
      measurement.sensorId,
      measurement.value,
      measurement.timeStamp,
      measurement.v,
      measurement.r,
      measurement.s,
    );

    createReceipt.wait();

    return createReceipt;
  }
}
