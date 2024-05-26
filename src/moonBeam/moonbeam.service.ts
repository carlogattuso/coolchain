import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import contractFile from '../contract/compileContract';
import { ConfigService } from '@nestjs/config';

// (Optional) Import your Moonbeam provider configuration interface/class
const CHAIN_NAME = 'moonbase-alpha';
const CHAIN_RPC_URL = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID = 1287;

@Injectable()
export class MoonbeamService {
  private provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: any };
  private contractAddress: any;

  constructor(private configService: ConfigService) {
    this.accountFrom = {
      privateKey: configService.get('WALLET_PRIVATE_KEY'),
    };
    this.contractAddress = configService.get('CONTRACT_ADDRESS');

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

  async sendMeasurement(sensorId: string, timeStampDateTime: Date, value: number, v: number, r: string, s: string): Promise<string> {
    // Example values
    const _value = {
      sensorId,
      timeStamp: timeStampDateTime.getTime(),
      value, v, r, s,
    };

    const wallet = new ethers.Wallet(
      this.accountFrom.privateKey,
      this.provider,
    );
    const coolChainContract = new ethers.Contract(this.contractAddress, contractFile.abi, wallet);

    const sendMeasurementToChain = async (): Promise<any> => {
      console.log(
        `Calling the sendMeasurement function with ${JSON.stringify(_value)} function in contract at address: ${this.contractAddress}`,
      );

      // 7. Sign and send tx and wait for receipt
      // sendMeasurement(uint64 sensorId, uint8 value, uint64 timestamp, uint8 v, bytes32 r, bytes32 s) public returns (uint256)
      const createReceipt = await coolChainContract.sendMeasurement(
        _value.sensorId,
        _value.value,
        _value.timeStamp,
        _value.v,
        _value.r,
        _value.s,
      );

      // Example request
      // const createReceipt = await coolChainContract.sendMeasurement(
      //   _value.sensorId,
      //   _value.value,
      //   _value.timeStamp,
      //   0,
      //   "0x7465737400000000000000000000000000000000000000000000000000000000",
      //   "0x7465737400000000000000000000000000000000000000000000000000000000",
      // );

      console.log(createReceipt);
      createReceipt.wait();

      console.log(`Tx successful with hash: ${createReceipt.hash}`);

      return createReceipt;
    };
    await sendMeasurementToChain();

    return `${sendMeasurementToChain}`;
  }
}
