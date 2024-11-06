import React from "react";
import {Breadcrumbs, Button} from "@nextui-org/react";
import {BreadcrumbItem} from "@nextui-org/breadcrumbs";
import {useRouter} from "next/navigation";

export const AddDevicesHeader = () => {

    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return <>
        <Breadcrumbs>
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Devices</BreadcrumbItem>
            <BreadcrumbItem>Add</BreadcrumbItem>
        </Breadcrumbs>

        <div className="flex  flex-wrap justify-between">
            <h3 className="text-xl font-semibold">Add device</h3>
            <Button color="primary" variant="faded" size="sm" onPress={handleBack}>
               Back
            </Button>
        </div>
    </>;
}