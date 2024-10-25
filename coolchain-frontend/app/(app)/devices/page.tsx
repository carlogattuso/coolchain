'use client';

import React from 'react';
import { Devices } from '@/components/devices';
import useSWR from 'swr';

const DevicesPage = () => {

  const { data, error, isLoading } = useSWR(`/devices`);

  if (error) return <p>Failed to load.</p>;
  if (isLoading) return <p>Loading...</p>;

  return <Devices data={data} />;
};

export default DevicesPage;
