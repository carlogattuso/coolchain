'use client';

import React from 'react';
import useSWR from 'swr';
import { Records } from '@/components/records';

const RecordsPage = () => {

  const { data, error, isLoading } = useSWR(`/records`);

  if (error) return <p>Failed to load.</p>;
  if (isLoading) return <p>Loading...</p>;

  return <Records data={data} />;
};

export default RecordsPage;
