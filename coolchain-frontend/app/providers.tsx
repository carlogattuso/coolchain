'use client';
import React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { isCoolchainError } from '@/helpers/types/CoolchainError';
import { ErrorCodes } from '@/utils/errors';
import { deleteAuthCookie } from '@/actions/auth.action';
import { SWRConfig } from 'swr';
import fetchWithCredentials from '@/helpers/fetcher';
import { useRouter } from 'next/navigation';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <MetaMaskProvider
      debug={true}
      sdkOptions={{
        dappMetadata: {
          name: 'Coolchain',
          url: process.env.NEXT_PUBLIC_DAPP_URL,
        },
      }}
    >
      <SWRConfig
        value={{
          fetcher: fetchWithCredentials,
          onError: async (error) => {
            if (isCoolchainError(error) && error.message === ErrorCodes.UNAUTHORIZED.code) {
              await deleteAuthCookie();
              router.replace('/signIn');
            }
          },
        }}
      >
        <NextUIProvider>
          <NextThemesProvider
            defaultTheme="system"
            attribute="class"
            {...themeProps}>
            {children}
          </NextThemesProvider>
        </NextUIProvider>
      </SWRConfig>
    </MetaMaskProvider>
  );
}
