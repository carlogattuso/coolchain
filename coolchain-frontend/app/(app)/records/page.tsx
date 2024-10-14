'use client';

import React from 'react';
import useSWR from 'swr';
import { Records } from '@/components/records';

const fetcher = async (...args: any[]) => {
  // @ts-ignore
  const res = await fetch(...args);
  return await res.json();
};
const RecordsPage = () => {

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/records`,
    fetcher,
  );

  if (error) return <p>Failed to load.</p>;
  if (isLoading) return <p>Loading...</p>;

  return <Records data={data} />;
};

export default RecordsPage;
