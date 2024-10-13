import {Device, isDevice} from "@/helpers/types/Device";

export interface Auditor {
    address: string;
    devices: Device[];
}

export function isAuditor(obj: any): obj is Auditor {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.address === 'string' &&
        ((obj.devices && obj.devices.length > 0 && isDevice(obj.devices[0])) || !obj.devices)
    )
}