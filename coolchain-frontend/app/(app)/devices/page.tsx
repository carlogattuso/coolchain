'use client';

import React from 'react';
import { Devices } from '@/components/devices';
import useSWR from 'swr';

const fetcher = (...args: any[]) => {
  // @ts-ignore
  return fetch(...args).then(res => res.json());
};
const DevicesPage = () => {

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/devices`,
    fetcher,
  );

  if (error) return <p>Failed to load.</p>;
  if (isLoading) return <p>Loading...</p>;

  return <Devices data={data} />;
};

export default DevicesPage;
