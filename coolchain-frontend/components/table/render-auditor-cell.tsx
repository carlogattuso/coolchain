import {Chip, Tooltip} from "@nextui-org/react";
import React from "react";
import {Auditor} from "@/helpers/types/Auditor";
import {copyTextToClipboard} from "@/helpers/copy";

interface Props {
    auditor: Auditor;
    columnKey: string | React.Key;
}

export const RenderAuditorCell = ({auditor, columnKey}: Props) => {
    // @ts-ignore
    const cellValue = auditor[columnKey];
    switch (columnKey) {
        case "address":
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => {
                        copyTextToClipboard(auditor.address);
                    }}
                >
                    <Tooltip content="Copy">
                        <button>
                            <span className="capitalize text-xs">{auditor.address}</span>
                        </button>
                    </Tooltip>
                </Chip>
            );
        case "devices":
            return auditor.devices.map((device) => (
                <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    className="mx-1"
                    onClick={() => {
                        copyTextToClipboard(device.address);
                    }}
                >
                    <Tooltip content="Copy address">
                        <button>
                            <span className="capitalize text-xs">{`${device.name}: ${device.address}`}</span>
                        </button>
                    </Tooltip>
                </Chip>
            ));

        default:
            return cellValue;
    }
};
