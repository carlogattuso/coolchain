import { SDKProvider } from '@metamask/sdk-react';
import { useCallback, useEffect } from 'react';
import { ErrorCodes } from '@/utils/errors';
import { deleteAuthCookie } from '@/actions/auth.action';
import { useRouter } from 'next/navigation';

interface MetamaskProps {
  provider?: SDKProvider | undefined;
}

export const useMetamask = ({ provider }: MetamaskProps) => {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace('/signIn');
  }, [router]);

  const requestAccounts = async () => {
    if (!provider) {
      throw new Error(ErrorCodes.METAMASK_PROVIDER_NOT_AVAILABLE.code);
    }
    const accounts = (await provider?.request({ method: 'eth_requestAccounts' })) as string[] | null;
    if (!accounts || !Array.isArray(accounts) || accounts.length !== 1) {
      throw new Error(
        !accounts
          ? ErrorCodes.METAMASK_EMPTY_ACCOUNT.code
          : ErrorCodes.METAMASK_MULTIPLE_ACCOUNTS_DISABLED.code,
      );
    }
    return accounts[0];
  };

  const signMessage = async (message: string, account: string) => {
    const signResult = (await provider?.request({
      method: 'personal_sign',
      params: [message, account],
    })) as string | null;

    if (!signResult) {
      throw new Error(ErrorCodes.METAMASK_EMPTY_SIGNATURE.code);
    }

    return signResult;
  };

  useEffect(() => {
    if (provider) {
      provider.on('accountsChanged', async () => {
        await handleLogout();
      });

      provider.on('chainChanged', async () => {
        await handleLogout();
      });

      return () => {
        provider.removeListener('accountsChanged', () => {
        });
        provider.removeListener('chainChanged', () => {
        });
      };
    }
  }, [provider]);

  return { requestAccounts, signMessage };
};