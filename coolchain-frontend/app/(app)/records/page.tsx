'use client';

import React from 'react';
import useSWR from 'swr';
import {Records} from '@/components/records';
import {Record, Status} from "@/helpers/types/Record";


const calculateStatus = (record: Record): string => {
    if (!record.events.length) {
        return Status.Pending;
    }
    return Status.Audited;
};

const transformData = (data: Record[]): Record[] => {
    return data.map(record => ({
        ...record,
        status: calculateStatus(record),
    }));
};


const RecordsPage = () => {

    const {
        data,
        error,
        isLoading
    } = useSWR(`/records`);

    if (error) return <p>Failed to load.</p>;
    if (isLoading) return <p>Loading...</p>;

    const transformedData = data ? transformData(data) : [];

    return <Records data={transformedData}/>;
};

export default RecordsPage;
