'use client';

import React from 'react';
import { Coins, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConmutadorTripleProps {
  value: string;
  onChange: (v: string) => void;
}

export function ConmutadorTriple({ value, onChange }: ConmutadorTripleProps) {
  return (
    <div className="flex bg-muted/50 p-1 rounded-full border shrink-0 h-10 items-center">
      <button
        type="button"
        onClick={() => onChange('todos')}
        className={cn(
          "h-8 px-4 rounded-full text-xs sm:text-sm font-bold font-body transition-all",
          value === 'todos' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        Todos
      </button>
      <button
        type="button"
        onClick={() => onChange('Efectivo')}
        className={cn(
          "h-8 px-4 rounded-full text-xs sm:text-sm font-bold font-body transition-all flex items-center gap-1.5",
          value === 'Efectivo' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Coins className="h-3 w-3" />
        Efectivo
      </button>
      <button
        type="button"
        onClick={() => onChange('Tarjeta')}
        className={cn(
          "h-8 px-4 rounded-full text-xs sm:text-sm font-bold font-body transition-all flex items-center gap-1.5",
          value === 'Tarjeta' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <CreditCard className="h-3 w-3" />
        Tarjeta
      </button>
    </div>
  );
}
