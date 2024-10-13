import {Chip, Tooltip} from "@nextui-org/react";
import React from "react";
import {Device} from "@/helpers/types/Device";
import {copyTextToClipboard} from "@/helpers/copy";

interface Props {
    device: Device;
    columnKey: string | React.Key;
}

export const RenderDeviceCell = ({device, columnKey}: Props) => {
    // @ts-ignore
    const cellValue = device[columnKey];
    switch (columnKey) {
        case "address":
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => {
                        copyTextToClipboard(device.address);
                    }}
                >
                    <Tooltip content="Copy">
                        <button>
                            <span className="capitalize text-xs">{device.address}</span>
                        </button>
                    </Tooltip>
                </Chip>
            );
        case "name":
            return (
                <span>
                    {device.name}
                </span>
            );
        case "auditorAddress":
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    onClick={() => {
                        copyTextToClipboard(device.auditorAddress);
                    }}
                >
                    <Tooltip content="Copy">
                        <button>
                            <span className="capitalize text-xs">{device.auditorAddress}</span>
                        </button>
                    </Tooltip>
                </Chip>
            );

        default:
            return cellValue;
    }
};
