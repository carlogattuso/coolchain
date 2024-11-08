'use server';

import { cookies } from 'next/headers';

export const createAuthCookie = async (accessToken: string) => {
  cookies().set('auth', accessToken, {
    secure: false,
    maxAge: 60 * 60 * 24,
    path: '/',
    httpOnly: true,
  });
};

// TODO add cleanup context

export const deleteAuthCookie = async () => {
  cookies().set('auth', 'value', { maxAge: 0 });
};
