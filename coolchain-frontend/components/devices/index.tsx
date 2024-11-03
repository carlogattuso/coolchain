'use client';
import React from 'react';
import {TableWrapper} from '@/components/table/table';
import {Device} from '@/helpers/types/Device';
import {DevicesHeader} from "@/components/devices/devicesHeader";

interface DevicesProps {
    data: Device[];
}

export const Devices = ({data}: DevicesProps) => {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <DevicesHeader/>

            <div className="max-w-[95rem] mx-auto w-full">
                <TableWrapper data={{
                    items: data,
                    columns: [
                        {name: 'Device', key: 'name'},
                        {name: 'Address', key: 'address'},
                    ],
                    emptyMessage: 'No devices found',
                }}/>
            </div>
        </div>
    );
};
