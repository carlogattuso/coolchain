'use client';
import {Breadcrumbs} from '@nextui-org/react';
import React from 'react';
import {TableWrapper} from '@/components/table/table';
import {BreadcrumbItem} from '@nextui-org/breadcrumbs';
import {Record} from '@/helpers/types/Record';

interface RecordsProps {
    data: Record[];
}

export const Records = ({data}: RecordsProps) => {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Devices</BreadcrumbItem>
            </Breadcrumbs>

            <h3 className="text-xl font-semibold">All Records</h3>

            <div className="max-w-[95rem] mx-auto w-full">
                <TableWrapper data={{
                    items: data.map((record: Record) => ({...record, value: record.value / 100})),
                    columns: [
                        {name: 'Id', key: 'id'},
                        {name: 'Value', key: 'value'},
                        {name: 'Timestamp', key: 'timestamp'},
                        {name: 'Device', key: 'deviceAddress'},
                    ],
                    emptyMessage: 'No records found',
                }}/>
            </div>
        </div>
    );
};
