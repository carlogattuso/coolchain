'use client';

import React from 'react';
import useSWR from 'swr';
import { Records } from '@/components/records';
import { Record, Status } from '@/helpers/types/Record';
import { Event } from '@/helpers/types/Event';
import { isPermitDeadlinePresent } from '@/helpers/status';


const calculateStatus = (record: Record): Status | void => {
  if (!isPermitDeadlinePresent(record)) {
    return Status.NotAudited;
  } else if (record.events.filter((event: Event) => event.eventType === 'SubcallSucceeded').length > 0) {
    return Status.Registered;
  } else if (record.events.filter((event: Event) => event.eventType === 'SubcallFailed').length > 0) {
    return Status.Failed;
  } else {
    return Status.Pending;
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
    isLoading,
  } = useSWR(`/records`);

  if (error) return <p>Failed to load.</p>;
  if (isLoading) return <p>Loading...</p>;

  const transformedData = data ? transformData(data) : [];

  return <Records data={transformedData} />;
};

export default RecordsPage;
