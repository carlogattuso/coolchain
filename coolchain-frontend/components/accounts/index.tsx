"use client";
import {Breadcrumbs, Button, Input} from "@nextui-org/react";
import React from "react";
import {ExportIcon} from "@/components/icons/accounts/export-icon";
import {TableWrapper} from "@/components/table/table";
import {BreadcrumbItem} from "@nextui-org/breadcrumbs";

export const Accounts = () => {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Accounts</BreadcrumbItem>
            </Breadcrumbs>

            <h3 className="text-xl font-semibold">All Accounts</h3>
            <div className="flex justify-between flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    <Input
                        classNames={{
                            input: "w-full",
                            mainWrapper: "w-full",
                        }}
                        placeholder="Search users"
                    />
                </div>
                <div className="flex flex-row gap-3.5 flex-wrap hidden">
                    <Button color="primary" startContent={<ExportIcon/>}>
                        Export to CSV
                    </Button>
                </div>
            </div>
            <div className="max-w-[95rem] mx-auto w-full">
                <TableWrapper/>
            </div>
        </div>
    );
};
