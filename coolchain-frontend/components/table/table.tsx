import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,} from "@nextui-org/react";
import React from "react";
import {isDevice} from "@/helpers/types/Device";
import {RenderDeviceCell} from "@/components/table/render-device-cell";
import {isAuditor} from "@/helpers/types/Auditor";
import {RenderAuditorCell} from "@/components/table/render-auditor-cell";
import {isRecord} from "@/helpers/types/Record";
import {RenderRecordCell} from "@/components/table/render-record-cell";

export const TableWrapper = ({data}) => {
    return (
        <div className=" w-full flex flex-col gap-4">
            <Table aria-label="Example table with custom cells" isStriped>
                <TableHeader columns={data.columns}>
                    {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
                </TableHeader>
                <TableBody items={data.items}>
                    {(item) => (
                        <TableRow key={item.address || item.id}>
                            {(columnKey) => {
                                if (isDevice(item)) {
                                    return (
                                        <TableCell>
                                            {RenderDeviceCell({device: item, columnKey: columnKey})}
                                        </TableCell>
                                    )
                                } else if (isAuditor(item)) {
                                    return (
                                        <TableCell>
                                            {RenderAuditorCell({auditor: item, columnKey: columnKey})}
                                        </TableCell>
                                    )
                                } else if (isRecord(item)) {
                                    return (
                                        <TableCell>
                                            {RenderRecordCell({record: item, columnKey: columnKey})}
                                        </TableCell>
                                    )
                                }
                                return (
                                    <TableCell children={null}/>
                                )
                            }
                            }
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
