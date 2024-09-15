export interface Record {
    _id: string;
    timestamp: string;
    txHash: string;
    value: number;
    sensorId: string;
}

export interface RecordsPageProps {
    records: Record[];
}