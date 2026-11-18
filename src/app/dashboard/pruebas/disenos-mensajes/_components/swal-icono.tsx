'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { SwalTipoIcono } from './datos-casos-reales';

interface SwalIconoProps {
  swalTipo: SwalTipoIcono;
  size?: 'md' | 'lg';
}

export function SwalIcono({ swalTipo, size = 'lg' }: SwalIconoProps) {
  const scaleClass = size === 'md' ? 'scale-[0.76] -m-2.5' : '';

  return (
    <div className={cn('swal2-icon-stage flex items-center justify-center shrink-0 select-none', scaleClass)}>
      {swalTipo === 'success' && (
        <div className="swal2-icon swal2-success">
          <div className="swal2-success-ring" />
          <span className="swal2-success-line-tip" />
          <span className="swal2-success-line-long" />
        </div>
      )}

      {swalTipo === 'error' && (
        <div className="swal2-icon swal2-error">
          <span className="swal2-x-mark">
            <span className="swal2-x-mark-line-left" />
            <span className="swal2-x-mark-line-right" />
          </span>
        </div>
      )}

      {swalTipo === 'warning' && (
        <div className="swal2-icon swal2-warning">
          <div className="swal2-icon-content">!</div>
        </div>
      )}

      {swalTipo === 'info' && (
        <div className="swal2-icon swal2-info">
          <div className="swal2-icon-content">i</div>
        </div>
      )}

      {swalTipo === 'question' && (
        <div className="swal2-icon swal2-question">
          <div className="swal2-icon-content">?</div>
        </div>
      )}
    </div>
  );
}
