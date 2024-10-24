'use client';
import React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { MetaMaskProvider } from '@metamask/sdk-react';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: 'Coolchain',
          url: process.env.NEXT_PUBLIC_DAPP_URL,
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
    </MetaMaskProvider>
  );
}
