'use client';

import React from 'react';
import useSWR from 'swr';
import {Records} from '@/components/records';
import {Record, Status} from "@/helpers/types/Record";
import { Event } from '@/helpers/types/Event';


const calculateStatus = (record: Record): Status | void => {
    if (!record.events.length) {
        return Status.Pending;
    } else if (record.events.filter((event: Event) => event.eventType === 'SubcallSucceeded').length > 0) {
        return Status.Registered;
    }
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
