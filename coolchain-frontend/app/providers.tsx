'use client';
import React, {createContext, useCallback, useState} from 'react';
import {NextUIProvider} from '@nextui-org/system';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {ThemeProviderProps} from 'next-themes/dist/types';
import {MetaMaskProvider} from '@metamask/sdk-react';
import {isCoolchainError} from '@/helpers/types/CoolchainError';
import {ErrorCodes} from '@/utils/errors';
import {deleteAuthCookie} from '@/actions/auth.action';
import {SWRConfig} from 'swr';
import fetchWithCredentials from '@/helpers/fetcher';
import {useRouter} from 'next/navigation';
import {JwtDTO} from "@/helpers/types/dto/JwtDTO";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

export interface UserContextType {
    user: JwtDTO;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function Providers({children, themeProps}: ProvidersProps) {
    const router = useRouter();

    const [user, setUser] = useState(null);

    // @ts-ignore
    // @ts-ignore
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
                        <UserContext.Provider value={{user, setUser}}>
                            {children}
                        </UserContext.Provider>
                    </NextThemesProvider>
                </NextUIProvider>
            </SWRConfig>
        </MetaMaskProvider>
    );
}
