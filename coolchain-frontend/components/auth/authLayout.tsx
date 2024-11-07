import { Image } from '@nextui-org/react';
import { Divider } from '@nextui-org/divider';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: Props) => {
  return (
    <div className="flex h-screen relative">

      {/* Left Section - Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 relative">
        {/* Background Gradient Image (Visible on Mobile) */}
        <div className="md:hidden absolute inset-0 z-0">
          <Image
            className="w-full h-full object-cover"
            src="https://nextui.org/gradients/docs-right.png"
            alt="gradient"
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>

      {/* Vertical Divider (Visible on Medium screens and above) */}
      <div className="hidden md:block">
        <Divider orientation="vertical" className="my-10" />
      </div>

      {/* Right Section - Logo and Text */}
      <div className="hidden md:flex flex-1 items-center justify-center p-6 relative">
        {/* Background Glow Effect */}
        <div
          className="absolute w-[300px] h-[300px] bg-gradient-to-r from-white-400 via-white-500 to-white-500 rounded-full"
          style={{
            filter: 'blur(100px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '-1',
          }}
        />

        {/* Logo and Text Content */}
        <div className="flex flex-col items-center justify-center z-10 text-center">
          <Image
            className="w-[300px] h-auto"
            src="/coolchain_logo.png"
            alt="Coolchain Logo"
          />
          <p className="text-[22px] mt-4">
            Protecting Health, Certifying Temperature
          </p>
        </div>
      </div>
    </div>
  );
};
