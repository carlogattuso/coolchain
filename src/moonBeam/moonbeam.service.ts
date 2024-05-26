import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import contractFile from '../contract/compileContract';
import { ConfigService } from '@nestjs/config';
import { BATCH_PRECOMPILE_ABI, BATCH_PRECOMPILE_ADDRESS } from '../utils/contants';

// (Optional) Import your Moonbeam provider configuration interface/class
const CHAIN_NAME = 'moonbase-alpha';
const CHAIN_RPC_URL = 'https://rpc.api.moonbase.moonbeam.network';
const CHAIN_ID = 1287;

@Injectable()
export class MoonbeamService {
  private provider: ethers.JsonRpcProvider;
  private accountFrom: { privateKey: any };
  private contractAddress: any;
  private wallet: ethers.Wallet;

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

    this.wallet = new ethers.Wallet(
      this.accountFrom.privateKey,
      this.provider,
    );
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

      console.log(createReceipt);
      createReceipt.wait();

      console.log(`Tx successful with hash: ${createReceipt.hash}`);

      return createReceipt;
    };
    await sendMeasurementToChain();

    return `${sendMeasurementToChain}`;
  }

  async callBatchPrecompileContract(): Promise<string> {

    const batchPrecompiled = new ethers.Contract(
      BATCH_PRECOMPILE_ADDRESS,
      BATCH_PRECOMPILE_ABI,
      this.wallet,
    );

    const callBatch = async (numberOfRequests: number = 1): Promise<any> => {
      console.log(`Calling the batch precompiled contract`);
      const addresses = Array(numberOfRequests).fill(this.contractAddress);
      const values = Array(numberOfRequests).fill(0);
      const gasLimit = [];

      const yourContractInterface = new ethers.Interface(contractFile.abi);

      const _value = {
        sensorId: '12',
        timeStamp: (new Date()).getTime(),
        value: 11,
        v: 0,
        r: '0x7465737400000000000000000000000000000000000000000000000000000000',
        s: '0x7465737400000000000000000000000000000000000000000000000000000000',
      };

      const callData = [yourContractInterface.encodeFunctionData(
        'sendMeasurement',
        [
          _value.sensorId,
          _value.value,
          _value.timeStamp,
          _value.v,
          _value.r,
          _value.s,
        ],
      )];

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
    await callBatch();

    return `${callBatch}`;
  }
}
