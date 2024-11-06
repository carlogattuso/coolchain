import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React from 'react';
import { Device, isDevice } from '@/helpers/types/Device';
import { RenderDeviceCell } from '@/components/table/render-device-cell';
import { isRecord, Record } from '@/helpers/types/Record';
import { RenderRecordCell } from '@/components/table/render-record-cell';

interface Column {
  name: string;
  key: keyof Device | keyof Record;
}

interface Data {
  items: (Device | Record)[];
  columns: Column[];
  emptyMessage: string;
}

interface TableWrapperProps {
  data: Data;
}

export const TableWrapper = ({ data }: TableWrapperProps) => {
  return (
    <div className=" w-full flex flex-col gap-4">
      <Table aria-label="Example table with custom cells" isStriped>
        <TableHeader columns={data.columns}>
          {(column) => <TableColumn key={column.key}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody items={data.items} emptyContent={data.emptyMessage}>
          {(item) => (
            <TableRow key={'address' in item ? item.address : item.id}>
              {(columnKey) => {
                if (isDevice(item)) {
                  return (
                    <TableCell>
                      {RenderDeviceCell({ device: item, columnKey: columnKey })}
                    </TableCell>
                  );
                } else if (isRecord(item)) {
                  return (
                    <TableCell>
                      {RenderRecordCell({ record: item, columnKey: columnKey })}
                    </TableCell>
                  );
                }
                return (
                  <TableCell>{null}</TableCell>
                );
              }
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
