'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-primary', className)} />;
};
