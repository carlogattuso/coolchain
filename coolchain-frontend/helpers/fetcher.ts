'use server';

import { cookies } from 'next/headers';
import { ErrorCodes } from '@/utils/errors';

export default async function fetchWithCredentials(
  path: string,
) {
  const accessToken = cookies().get('auth')?.value;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.status === 401 ?
      ErrorCodes.UNAUTHORIZED.code :
      ErrorCodes.ERROR_FETCHING_DATA.code);
  }

  return response.json();
}