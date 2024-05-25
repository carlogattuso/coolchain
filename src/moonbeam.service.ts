import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';

// (Optional) Import your Moonbeam provider configuration interface/class

@Injectable()
export class MoonbeamService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Configure Moonbeam provider based on your setup
    const providerRPC = {
      moonbase: {
        name: 'moonbase-alpha',
        rpc: 'https://rpc.api.moonbase.moonbeam.network',
        chainId: 1287, // 0x507 in hex,
      },
    };
    this.provider = new ethers.JsonRpcProvider(providerRPC.moonbase.rpc, {
      chainId: providerRPC.moonbase.chainId,
      name: providerRPC.moonbase.name,
    });
  }

  async getBlockNumber(): Promise<number> {
    const blockNumber = await this.provider.getBlockNumber();
    return blockNumber;
  }

  async balances(): Promise<string> {
    const addressFrom = 'INSERT_FROM_ADDRESS';
    const addressTo = 'INSERT_TO_ADDRESS';
    const balanceFrom = ethers.formatEther(
      await this.provider.getBalance(addressFrom),
    );
    const balanceTo = ethers.formatEther(
      await this.provider.getBalance(addressTo),
    );

    return `The balance of ${addressFrom} is: ${balanceFrom} DEV \n The balance of ${addressTo} is: ${balanceTo} DEV`;
  }
}
