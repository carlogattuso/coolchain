'use client';
import React, {useContext} from 'react';
import {AddMultipleDevicesSchema} from "@/helpers/schemas";
import {Button, ButtonGroup, Input} from "@nextui-org/react";
import {FieldArray, Formik} from "formik";
import {useRouter} from "next/navigation";
import {AddDevicesHeader} from "@/components/devices/addDevicesHeader";
import {registerDevices} from "@/services/networkService";
import {UserContext} from "@/app/providers";
import NextuiAlert from "nextui-alert";
import {Divider} from "@nextui-org/divider";

interface DeviceType {
    name: string;
    address: string;
}

export const AddMultipleDevicesForm = () => {
    const router = useRouter();
    const {user} = useContext(UserContext);
    const initialValues: { devices: DeviceType[] } = {
        devices: [
            {name: 'Device 01', address: '0x0000000000000000000000000000000000000000'},
        ],
    };

    const handleAddDevice = async (values: { devices: DeviceType[] }, {setStatus, setSubmitting}) => {
        try {
            console.log("devices", values)
            const responseData = await registerDevices(values.devices, user.accessToken);
            if (responseData.error) {
                setStatus(responseData.message);
            } else {
                router.replace('/devices');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <AddDevicesHeader/>
            <div className="max-w-[95rem] mx-auto w-full">
                <Formik
                    initialValues={initialValues}
                    validationSchema={AddMultipleDevicesSchema}
                    onSubmit={handleAddDevice}>
                    {({values, errors, touched, handleChange, handleSubmit, isSubmitting, status}) => (
                        <>
                            <FieldArray name="devices">
                                {({insert, remove, push}) => (
                                    <div>
                                        {values.devices.map((device, index) => (
                                            <div className="flex flex-col w-1/2 gap-4 mb-4" key={index}>
                                                <h3 className="font-bold">Device {index + 1}</h3>
                                                <Input
                                                    variant="bordered"
                                                    label="Name"
                                                    value={device.name}
                                                    isInvalid={!!errors?.devices?.[index]?.name && !!touched?.devices?.[index]?.name}
                                                    errorMessage={errors?.devices?.[index]?.name}
                                                    onChange={handleChange(`devices.${index}.name`)}
                                                />
                                                <Input
                                                    variant="bordered"
                                                    label="Address"
                                                    value={device.address}
                                                    isInvalid={!!errors?.devices?.[index]?.address && !!touched?.devices?.[index]?.address}
                                                    errorMessage={errors?.devices?.[index]?.address}
                                                    onChange={handleChange(`devices.${index}.address`)}
                                                />
                                                <ButtonGroup className="justify-end">
                                                    {(index !== 0) && (
                                                        <Button
                                                            variant="flat"
                                                            color="secondary"
                                                            size="sm"
                                                            onPress={() => remove(index)}>
                                                            Remove
                                                        </Button>
                                                    )}
                                                    {(index === values.devices.length - 1) && (
                                                        <Button
                                                            variant="flat"
                                                            color="secondary"
                                                            size="sm"
                                                            onPress={() => push({name: '', address: ''})}>
                                                            Add Device
                                                        </Button>
                                                    )}
                                                </ButtonGroup>
                                                <Divider></Divider>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FieldArray>
                            {status &&
                                <NextuiAlert severity="danger" variant="bordered" title="Error"
                                             className="flex flex-col w-1/2 gap-4 mb-4">
                                    {status}
                                </NextuiAlert>
                            }
                            <Button
                                onPress={handleSubmit}
                                variant="flat"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                Submit
                            </Button>
                        </>
                    )}
                </Formik>
            </div>
        </div>
    );
};