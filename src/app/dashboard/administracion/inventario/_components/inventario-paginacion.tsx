'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InventarioPaginacionProps {
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function InventarioPaginacion({
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
}: InventarioPaginacionProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-app-border p-3 sm:p-4 bg-[#1e1e1e]">
      <div className="flex items-center space-x-2">
        <p className="text-xs font-medium text-slate-400">Filas por página</p>
        <Select
          value={`${itemsPerPage}`}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs rounded-full bg-app-surface border-app-border text-white">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent side="top" className="bg-[#1e1e1e] border-app-border text-white text-xs">
            {[10, 20, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-8 px-3 rounded-full text-xs border-app-border bg-app-surface text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span>Anterior</span>
        </Button>
        <div className="text-xs font-semibold text-slate-300 px-2">
          Pág. {currentPage} de {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="h-8 px-3 rounded-full text-xs border-app-border bg-app-surface text-slate-300 hover:text-white"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
