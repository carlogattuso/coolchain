import {Chip, Tooltip} from "@nextui-org/react";
import React from "react";
import {Auditor} from "@/helpers/types/Auditor";
import {copyTextToClipboard} from "@/helpers/copy";
import {Record} from "@/helpers/types/Record";

interface Props {
    record: Record;
    columnKey: string | React.Key;
}

export const RenderRecordCell = ({record, columnKey}: Props) => {
    // @ts-ignore
    const cellValue = record[columnKey];
    switch (columnKey) {
        case "deviceAddress":
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    onClick={() => {
                        copyTextToClipboard(record.deviceAddress);
                    }}
                >
                    <Tooltip content="Copy">
                        <button>
                            <span className="capitalize text-xs">{record.deviceAddress}</span>
                        </button>
                    </Tooltip>
                </Chip>
            );
        case "timestamp":
            return (
                <span>{((new Date(record.timestamp * 1000)).toLocaleString())}</span>
            )
        default:
            return cellValue;
    }
};
