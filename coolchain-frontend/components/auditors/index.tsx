"use client";
import {Breadcrumbs} from "@nextui-org/react";
import React from "react";
import {TableWrapper} from "@/components/table/table";
import {BreadcrumbItem} from "@nextui-org/breadcrumbs";


export const Auditors = ({data}) => {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Auditors</BreadcrumbItem>
            </Breadcrumbs>

            <h3 className="text-xl font-semibold">All Auditors</h3>

            <div className="max-w-[95rem] mx-auto w-full">
                <TableWrapper data={{
                    items: data,
                    columns: [
                        {name: "Address", key: "address"},
                        {name: "Devices", key: "devices"},
                    ]
                }}/>
            </div>
        </div>
    );
};
