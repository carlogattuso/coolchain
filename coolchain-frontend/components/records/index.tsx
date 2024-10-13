"use client";
import {Breadcrumbs} from "@nextui-org/react";
import React from "react";
import {TableWrapper} from "@/components/table/table";
import {BreadcrumbItem} from "@nextui-org/breadcrumbs";


export const Records = ({data}) => {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Devices</BreadcrumbItem>
            </Breadcrumbs>

            <h3 className="text-xl font-semibold">All Records</h3>

            <div className="max-w-[95rem] mx-auto w-full">
                <TableWrapper data={{
                    items: data,
                    columns: [
                        {name: "ID", key: "id"},
                        {name: "Value", key: "value"},
                        {name: "Datetime", key: "timestamp"},
                        {name: "Device Address", key: "deviceAddress"}
                    ]
                }}/>
            </div>
        </div>
    );
};
