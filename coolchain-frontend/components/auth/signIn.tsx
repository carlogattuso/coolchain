'use client';

import {Button, Image} from '@nextui-org/react';
import React, {useContext, useState} from 'react';
import {useSDK} from '@metamask/sdk-react';
import {ErrorMessage} from '@/components/errors/error-message';
import {ErrorCodes} from '@/utils/errors';
import {isCoolchainError} from '@/helpers/types/CoolchainError';
import {getSiweMessage, signIn} from '@/services/networkService';
import {useMetamask} from '@/components/hooks/useMetamask';
import {isMetamaskError} from '@/helpers/types/MetamaskError';
import {createAuthCookie} from '@/actions/auth.action';
import {JwtDTO} from '@/helpers/types/dto/JwtDTO';
import {useRouter} from 'next/navigation';
import {UserContext} from "@/app/providers";

export const SignIn = () => {
    const router = useRouter();
    const {connecting, provider, chainId} = useSDK();
    const {requestAccounts, signMessage} = useMetamask({provider});
    const [errorMessage, setErrorMessage] = useState<string>('');

    // @ts-ignore
    const {user, setUser} = useContext(UserContext);

    const handleSignIn = async () => {
        setErrorMessage('');

        try {
            if (chainId !== process.env.NEXT_PUBLIC_CHAIN_ID_HEX) {
                setErrorMessage(ErrorCodes.METAMASK_WRONG_CHAIN_ID.message);
                return;
            }

            const account = await requestAccounts();
            const messageToSign = await getSiweMessage(account);
            const signature = await signMessage(messageToSign.message, account);

            const signInData: JwtDTO = await signIn({auditorAddress: account, signature});
            setUser(signInData)
            await createAuthCookie(signInData.accessToken);

            if (signInData.isNew) {
                router.replace('/devices/add-multiple');
            } else {
                router.replace('/devices');
            }
        } catch (error) {
            const errorCode =
                isMetamaskError(error) ?
                    String(error.code) : isCoolchainError(error)
                        ? error.message
                        : ErrorCodes.UNEXPECTED_ERROR.code;

            const errorEntry = Object.values(ErrorCodes).find((entry) => entry.code === errorCode);
            setErrorMessage(errorEntry?.message || ErrorCodes.UNEXPECTED_ERROR.message);
        }
    }

    return (
        <div className="text-center">
            <h1 className="text-[25px] font-bold mb-4">Sign In</h1>

            <Button
                onPress={handleSignIn}
                isDisabled={connecting}
                variant="flat"
                aria-label="Connect your account"
                color="warning"
            >
                <Image
                    src={'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'}
                    alt="MetaMask Logo"
                    style={{width: '24px', marginRight: '10px'}}
                />
                Connect your account
            </Button>

            <ErrorMessage show={!!errorMessage} message={errorMessage}/>
        </div>
    );
};
