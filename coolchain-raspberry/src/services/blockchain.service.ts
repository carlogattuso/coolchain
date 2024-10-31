import { AddressLike, ethers, TypedDataDomain, Wallet } from 'ethers';
import { config } from '../config/config';
import { RecordDTO } from '../types/dto/RecordDTO';
import { getCoolchainContract, getJsonRpcProvider, getNonce, parseAxiosError } from '../utils/utils';
import { ECDSASignature } from '../types/ECDSASignature';
import { Record } from '../types/Record';
import axios from 'axios';
import { RecordService } from './record.service';
import {
  DAY_IN_SECONDS,
  PERMIT_PRECOMPILE_ADDRESS,
  PERMIT_PRECOMPILE_GAS_LIMIT,
  PERMIT_PRECOMPILE_NAME,
  PERMIT_PRECOMPILE_TYPES,
} from '../utils/constants';

export class BlockchainService {
  private readonly wallet: Wallet;
  private recordService: RecordService = new RecordService();
  private readonly permitEip712domain: TypedDataDomain;

  constructor() {
    this.wallet = new Wallet(config.privateKey, getJsonRpcProvider());
    this.permitEip712domain = {
      name: PERMIT_PRECOMPILE_NAME,
      version: '1',
      chainId: config.chainId,
      verifyingContract: PERMIT_PRECOMPILE_ADDRESS,
    };
  }

  public async storeRecord() {
    const nextSample: number | null = this.recordService.getRecordValue();
    //TODO: do not merge to master
    // if (!nextSample) return;

    const record: Record = {
      deviceAddress: this.wallet.address,
      value: nextSample ?? Math.round(Math.random() * 100),
      timestamp: Math.floor(Date.now() / 1000),
    };

    let recordWithPermit: RecordDTO;
    try {
      recordWithPermit = await this.requestPermit(record);
      console.log('New Record: ', recordWithPermit);
    } catch (error) {
      console.error('Error requesting permit: ', error);
      return;
    }

    try {
      await axios.post(`${config.coolchainUrl}/records`, recordWithPermit, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.info('Record successfully sent to Coolchain');
    } catch (error) {
      console.error(parseAxiosError(error));
    }
  }

  private async requestPermit(_record: Record): Promise<RecordDTO> {
    const typedData = await this.buildPermitTypedData(_record);

    const signedPermitRequest: string = await this.wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    );

    const permitSignature: ECDSASignature = ethers.Signature.from(signedPermitRequest);

    return {
      ..._record,
      permitDeadline: typedData.message.deadline,
      permitSignature: {
        v: permitSignature.v,
        r: permitSignature.r,
        s: permitSignature.s,
      },
    };
  }

  private async buildPermitTypedData(_record: Record) {
    const from = this.wallet.address as AddressLike;
    const contractInterface: ethers.Interface = new ethers.Interface(
      getCoolchainContract().abi,
    );
    const storeRecordCallData = contractInterface.encodeFunctionData('storeRecord', [
      _record.deviceAddress,
      _record.value,
      _record.timestamp,
    ]);

    const permitMessage = {
      from: from,
      to: config.contractAddress as AddressLike,
      value: 0,
      data: storeRecordCallData,
      gaslimit: PERMIT_PRECOMPILE_GAS_LIMIT,
      nonce: await getNonce(from),
      deadline: _record.timestamp + DAY_IN_SECONDS,
    };

    return {
      types: PERMIT_PRECOMPILE_TYPES,
      primaryType: 'CallPermit',
      domain: this.permitEip712domain,
      message: permitMessage,
    };
  }
}
