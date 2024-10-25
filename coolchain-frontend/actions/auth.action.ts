'use server';

import { cookies } from 'next/headers';

export const createAuthCookie = async (accessToken: string) => {
  cookies().set('auth', accessToken, {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/',
    httpOnly: true,
  });
};

export const deleteAuthCookie = async () => {
  cookies().set('auth', 'value', { maxAge: 0 });
};
