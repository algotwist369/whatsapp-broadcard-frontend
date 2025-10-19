'use client';

import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StatusCardProps {
  status: 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

export function StatusCard({ status, title, description }: StatusCardProps) {
  const statusConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    error: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-md p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${config.titleColor}`}>{title}</h3>
          <div className={`mt-2 text-sm ${config.textColor}`}>
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
