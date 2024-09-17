import dotenv from 'dotenv';
import axios from 'axios';
import {Wallet} from 'ethers';

dotenv.config();

interface Record {
  deviceId: string,
  value: number
}

function getPrivateKey(): string {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Please provide a PRIVATE_KEY to start storing records');
  }
  return privateKey;
}

async function storeRecord(_address: string) {
  const mockValue: number = Math.floor(Math.random() * 11);
  const record: Record = {
    deviceId: _address,
    value: mockValue
  }

  try {
    const response = await axios.post(`${process.env.COOLCHAIN_URL}/`, record, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Server response:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Request error: ${error.response?.status} - ${error.message}`);
    } else {
      console.error(`Unknown error: ${error}`);
    }
  }
}

async function storeTask(): Promise<void> {
  // 1. Create wallet instance
  const privateKey = getPrivateKey();
  const wallet: Wallet = new Wallet(privateKey);

  // 2. Call permit
  /* TODO: Implement call permit with coolchain main wallet */

  // 3. Store records
  setInterval(() => storeRecord(wallet.address), 10000);
}

storeTask()