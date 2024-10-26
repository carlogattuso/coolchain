import {Addressable, AddressLike, ethers, Signature, SignatureLike, TypedDataDomain, Wallet} from 'ethers';
import {config} from '../config/config';
import {RecordDTO} from '../types/dto/RecordDTO';
import {getJsonRpcProvider, parseAxiosError} from '../utils/utils';
import {ECDSASignature} from '../types/ECDSASignature';
import {Record} from '../types/dto/Record';
import axios from 'axios';
import {RecordService} from './record.service';
import {EIP712Record} from "../types/EIP712Record";
import contractFile from "../contract/compile.contract";
import {Web3} from "web3";

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
    private recordService: RecordService;

    private web3;

    constructor() {
        try {
            this.wallet = new Wallet(config.privateKey, getJsonRpcProvider());

            // Web3 setup
            this.web3 = new Web3(new Web3.providers.HttpProvider(config.chainRpcUrl));
            const account = this.web3.eth.accounts.privateKeyToAccount(config.privateKey);
            this.web3.eth.accounts.wallet.add(account);

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

        const signedRecord: RecordDTO = await this.signRecord(record);

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
        const dataToSign = {..._record};

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
        const nonce = await getJsonRpcProvider().getTransactionCount(from);
        console.log("Nonce", nonce)
        const deadline = Math.floor((new Date(Date.UTC(2024, 11, 31, 23, 59, 59, 999))).getTime() / 1000);
        const eip712Record: EIP712Record = await this.signEIP712Record(_record)

        const contractInterface: ethers.Interface = new ethers.Interface(
            contractFile.abi,
        );

        console.log("EIP712Record: ", eip712Record);

        const recordCallData = contractInterface.encodeFunctionData('storeRecord', [
            eip712Record.deviceAddress,
            eip712Record.value,
            eip712Record.timestamp,
            eip712Record.v,
            eip712Record.r,
            eip712Record.s,
        ]);

        const message = {
            from,
            to,
            value,
            data: recordCallData,
            gasLimit,
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

        let typedData = JSON.stringify({
            types: {
                EIP712Domain: [
                    {
                        name: 'name',
                        type: 'string',
                    },
                    {
                        name: 'version',
                        type: 'string',
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'verifyingContract',
                        type: 'address',
                    },
                ],
                CallPermit: [
                    {
                        name: 'from',
                        type: 'address',
                    },
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: 'value',
                        type: 'uint256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                    {
                        name: 'gaslimit',
                        type: 'uint64',
                    },
                    {
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        name: 'deadline',
                        type: 'uint256',
                    },
                ],
            },
            primaryType: 'CallPermit',
            domain,
            message,
        });
        typedData = JSON.stringify({
            types: {
                CallPermit: [
                    {
                        name: 'from',
                        type: 'address',
                    },
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: 'value',
                        type: 'uint256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                    {
                        name: 'gaslimit',
                        type: 'uint64',
                    },
                    {
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        name: 'deadline',
                        type: 'uint256',
                    },
                ],
            },
            primaryType: 'CallPermit',
            domain,
            message,
        });

        return {
            typedData,
            message,
        };
    }

    private async signDataForPermit({messageData}: { messageData: any }) {
        const method = 'eth_signTypedData_v4';
        const from = messageData.message.from;
        const params = [from, messageData.typedData.types];

        console.log("from", from);
        console.log("params", params);

        // @ts-ignore
        this.web3.currentProvider.sendAsync(
            {
                method,
                params,
                from,
            },
            function (err, result) {
                if (err) return console.dir(err);
                if (result.error) {
                    return console.error('ERROR', result);
                }
                console.log('Signature:' + JSON.stringify(result.result));

                const ethersSignature = ethers.Signature.from(result.result);
                const formattedSignature = {
                    r: ethersSignature.r,
                    s: ethersSignature.s,
                    v: ethersSignature.v,
                };
                console.log(formattedSignature);
                return formattedSignature;
            }
        );
    }


    private async signRecord(_record: Record): Promise<RecordDTO | undefined> {
        const signature = await this.wallet.signTypedData(this.domain, this.types, _record);
        const recordSignature: ECDSASignature = ethers.Signature.from(signature);

        return
        const permitData = await this.createPermitMessageData(_record);

        console.log("permitData", permitData)

        // Define permit structure
        // const permitDomain = messageData.domain;
        // const permitTypes = messageData.typedData;
        const permitMessage = permitData.message;

        //
        // TODO: add nonce and datelimit to the record model or transaction data
        const messageData = await this.createPermitMessageData(_record);

        // const method = 'eth_signTypedData_v4';
        // const from = messageData.message.from;
        // const params = [from, messageData.typedData];



        try {
            // const etherTransaction = await this.signPermitTransaction(permitMessage);
            console.log("Permit transaction data", messageData)
            return
            const etherTransaction = await this.signPermitTransaction(messageData.message)
            const permitSignature: ECDSASignature = ethers.Signature.from(etherTransaction.signature as SignatureLike);
            // const permitSignature: ECDSASignature | undefined = await this.signDataForPermit({messageData})

            console.log("Permit signature", permitSignature);
            console.log("Permit signature v", permitSignature.v);
            console.log("Permit data", permitData);
            return {
                ..._record,
                recordSignature: {
                    v: recordSignature.v,
                    r: recordSignature.r,
                    s: recordSignature.s,
                },
                // nonce,
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

    private async signPermitTransaction(permitData: {
        gasLimit: number;
        data: string;
        from: string | Promise<string> | Addressable;
        to: string | Promise<string> | Addressable;
        deadline: number;
        value: number;
        nonce: number
    }) {
        const transaction = await this.wallet.populateTransaction(permitData)
        const signedTransaction = await this.wallet.signTransaction(transaction);
        const etherTransaction = ethers.Transaction.from(signedTransaction);
        return etherTransaction;
    }
}
