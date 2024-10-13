export interface Event {
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    address: string;
    data: string;
    topics: string[];
    index: number[];
    transactionIndex: number;
    recordId: string;
}

export function isEvent(obj: any): obj is Event {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.transactionHash === 'string' &&
        typeof obj.blockHash === 'string' &&
        typeof obj.blockNumber === 'number' &&
        typeof obj.address === 'string' &&
        typeof obj.address === 'string'
    )
}