'use client';
import React, {useCallback, useContext, useState} from 'react';
import {AddDeviceSchema} from "@/helpers/schemas";
import {Button, Input} from "@nextui-org/react";
import {Formik} from "formik";
import {AddDeviceFormType} from "@/helpers/forms";
import {useRouter} from "next/navigation";
import {AddDevicesHeader} from "@/components/devices/addDevicesHeader";
import {registerDevice} from "@/services/networkService";
import {UserContext} from "@/app/providers";
import NextuiAlert from "nextui-alert";


export const AddDevicesForm = () => {
    const router = useRouter();
    const {user, setUser} = useContext(UserContext);
    const initialValues: AddDeviceFormType = {
        name: 'Device 01',
        address: '0x0000000000000000000000000000000000000000',
    };

    const handleAddDevice = async (values: AddDeviceFormType, {setStatus, setSubmitting}) => {
        try {
            const responseData = await registerDevice({address: values.address, name: values.name}, user.accessToken);
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
                    validationSchema={AddDeviceSchema}
                    onSubmit={handleAddDevice}>
                    {({values, errors, touched, handleChange, handleSubmit, isSubmitting, status}) => (
                        <>
                            <div className="flex flex-col w-1/2 gap-4 mb-4">
                                <Input
                                    variant="bordered"
                                    label="Name"
                                    value={values.name}
                                    isInvalid={!!errors.name && !!touched.name}
                                    errorMessage={errors.name}
                                    onChange={handleChange('name')}
                                />
                                <Input
                                    variant="bordered"
                                    label="Address"
                                    value={values.address}
                                    isInvalid={!!errors.address && !!touched.address}
                                    errorMessage={errors.address}
                                    onChange={handleChange('address')}
                                />

                                {status &&
                                    <NextuiAlert severity="danger" variant="bordered" title="Error">
                                        {status}
                                    </NextuiAlert>
                                }
                            </div>

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
