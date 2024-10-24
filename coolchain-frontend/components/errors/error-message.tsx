'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';

interface ErrorMessageProps {
  show: boolean;
  message: string | React.ReactNode;
  onDismiss?: () => void;
  id?: string;
  className?: string;
}

export const ErrorMessage = ({ show, message }: ErrorMessageProps) => {
  if (!show) return null;
  return (
    <Card
      className={'m-2 border-danger bg-danger-50 dark:bg-danger-100/10'}
    >
      <CardBody className="flex flex-row items-center gap-1 p-1 overflow-hidden">
        <Chip
          variant="flat"
          color="danger"
          className="sm min-w-fit"
          size="sm"
        >
          Error
        </Chip>
        <span className="mx-2 text-danger text-tiny flex-grow">
          {message}
        </span>
      </CardBody>
    </Card>
  );
};

export default ErrorMessage;