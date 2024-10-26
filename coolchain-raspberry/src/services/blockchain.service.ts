import {AddressLike, ethers, SignatureLike, TypedDataDomain, Wallet} from 'ethers';
import {config} from '../config/config';
import {RecordDTO} from '../types/dto/RecordDTO';
import {getJsonRpcProvider, parseAxiosError} from '../utils/utils';
import {ECDSASignature} from '../types/ECDSASignature';
import {Record} from '../types/dto/Record';
import axios from 'axios';
import {RecordService} from './record.service';
import {EIP712Record} from "../types/EIP712Record";
import contractFile from "../contract/compile.contract";
import {getNonce} from "../utils/permitFunctions";

export class BlockchainService {
    private wallet: Wallet;
    private domain: TypedDataDomain;
    private readonly types = {
        Record: [
            {name: 'deviceAddress', type: 'address'},
            {name: 'value', type: 'uint8'},
            {name: 'timestamp', type: 'uint64'},
        ],
    };
    private recordService: RecordService | undefined;

    constructor() {
        try {
            this.wallet = new Wallet(config.privateKey, getJsonRpcProvider());
            // EIP712 domain configuration
            this.domain = {
                name: 'coolchain',
                version: '1',
                chainId: config.chainId,
                verifyingContract: config.contractAddress,
                salt: config.salt,
            };
            this.recordService = new RecordService();

        } catch (error) {
            console.error('BlockchainService initialization failed:', error);
        }
    }

    public async storeRecord() {
        const nextSample: number | null = this.recordService.getRecordValue();
        // if (!nextSample) return;

        const record: Record = {
            deviceAddress: this.wallet.address,
            // value: nextSample || Math.round(Math.random()*100),
            value: Math.round(Math.random() * 100),
            timestamp: Math.floor(Date.now() / 1000),
        };

        console.info('New record: ', record);

        const signedRecord: RecordDTO | undefined = await this.signRecord(record);

        try {
            await axios.post(`${config.coolchainAPIUrl}/records`, signedRecord, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.info('Record successfully sent to Coolchain');
        } catch (error) {
            console.error(parseAxiosError(error));
        }
    }

    private async signEIP712Record(_record: Record): Promise<EIP712Record> {
        const dataToSign = {
            deviceAddress: await this.wallet.getAddress(),
            value: _record.value,
            timestamp: _record.timestamp,
        };

        const signature = await this.wallet.signTypedData(
            this.domain,
            this.types,
            dataToSign,
        );
        const {r, s, v} = ethers.Signature.from(signature);

        return {
            deviceAddress: dataToSign.deviceAddress,
            value: dataToSign.value,
            timestamp: dataToSign.timestamp,
            v: v,
            r: r,
            s: s,
        };
    }

    private async createPermitMessageData(_record: Record) {
        const from: AddressLike = this.wallet.address as AddressLike;
        const to: AddressLike = config.contractAddress as AddressLike;
        const value = 0;
        const gasLimit = 100000;
        const nonce = await getNonce(from);
        const deadline = Math.floor(new Date(Date.UTC(2024, 12, 31, 23, 59, 59, 999)).getTime() / 1000);
        const eip712Record: EIP712Record = await this.signEIP712Record(_record)


        // SetMessage
        const contractInterface: ethers.Interface = new ethers.Interface(
            contractFile.abi,
        );
        const recordCallData = contractInterface.encodeFunctionData('storeRecord', [
            eip712Record.deviceAddress,
            eip712Record.value,
            eip712Record.timestamp
        ]);

        const message = {
            from,
            to,
            value,
            data: recordCallData,
            gaslimit: gasLimit,
            nonce,
            deadline,
        };

        const CALL_PERMIT_PRECOMPILE_NAME = 'Call Permit Precompile';
        const CALL_PERMIT_ADDRESS = '0x000000000000000000000000000000000000080a';
        const domain = {
            name: CALL_PERMIT_PRECOMPILE_NAME,
            version: '1',
            chainId: config.chainId,
            verifyingContract: CALL_PERMIT_ADDRESS,
        }

        const typedData = {
            types: {
                CallPermit: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                    { name: 'gaslimit', type: 'uint64' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            },
            primaryType: 'CallPermit',
            domain: {
                name: 'Call Permit Precompile',
                version: '1',
                chainId: 1287,
                verifyingContract: '0x000000000000000000000000000000000000080a',
            },
            message: message,
        };

        return {
            typedData,
            domain,
            message,
        };
    }

    private async signRecord(_record: Record): Promise<RecordDTO | undefined> {
        const signature = await this.wallet.signTypedData(this.domain, this.types, _record);
        const recordSignature: ECDSASignature = ethers.Signature.from(signature);
        const messageData = await this.createPermitMessageData(_record);

        // Define permit structure
        const permitDomain = messageData.domain;
        const permitTypes = messageData.typedData;
        const permitData = messageData.message;

        try {
            console.log("permitDomain", permitDomain)
            console.log("permitTypes", permitTypes.types)
            console.log("permitData", permitData)
            // Signature with typed data
            const permitSigned = await this.wallet.signTypedData(
                permitDomain,
                permitTypes.types,
                permitData,
            );
            const permitSignature: ECDSASignature = ethers.Signature.from(permitSigned);

            console.log("Record data", _record);
            console.log("Permit signature", permitSignature);
            console.log("v", permitSignature.v)
            return {
                ..._record,
                recordSignature: {
                    v: recordSignature.v,
                    r: recordSignature.r,
                    s: recordSignature.s,
                },
                permitSignature: {
                    v: permitSignature.v,
                    r: permitSignature.r,
                    s: permitSignature.s,
                },
            };
        } catch (error) {
            console.error(error);
        }
    }
}
