import { Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";

interface Props {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: Props) => {
  return (
    <div className='flex h-screen'>
      <div className='flex-1 flex-col flex items-center justify-center p-6'>
        <div className='md:hidden absolute left-0 right-0 bottom-0 top-0 z-0'>
          <Image
            className='w-full h-full'
            src='https://nextui.org/gradients/docs-right.png'
            alt='gradient'
          />
        </div>
        {children}
      </div>

      <div className='hidden my-10 md:block'>
        <Divider orientation='vertical' />
      </div>

      <div className='hidden md:flex flex-1 relative flex items-center justify-center p-6'>
        <div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500"
          style={{
            filter: 'blur(100px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '-1'
          }}
        />

        <div className='z-10'>
          <Image
            className='w-[300px] h-auto mx-auto'
            src='/coolchain_logo.png'
            alt='coolchain_logo'
          />
          <div className='text-gray-800 text-sm mt-4 text-center'>
            Protecting Health, Certifying Temperature
          </div>
        </div>
      </div>
    </div>
  );
};
