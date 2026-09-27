'use client'

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, where, doc, Timestamp } from 'firebase/firestore';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Pago, Generales, CierreCaja } from '@/lib/tipos';
import { useSucursal } from '@/hooks/use-sucursal';

// Componentes Refactorizados
import { EncabezadoPagos } from './_components/EncabezadoPagos';
import { ListaPagos } from './_components/ListaPagos';

type PagoConDocId = Pago & { id: string };

const toDate = (fecha: any): Date => {
  if (fecha instanceof Timestamp) return fecha.toDate();
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
};

export default function PaginaGestionPagos() {
    const { firestore } = useFirebase();
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();
    
    const [filtro, setFiltro] = useState('');
    const [periodoFiltro, setPeriodoFiltro] = useState<string>('actual');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 1. Obtener datos del turno abierto (Actual)
    const generalesRef = useMemoFirebase(() => 
        firestore && sucursalId ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null
    , [firestore, sucursalId]);
    const { data: estadoCaja, isLoading: cargandoEstadoCaja } = useDoc<Generales>(generalesRef);

    // 2. Obtener historial de cierres para el selector
    const cierresQuery = useMemoFirebase(() => 
        (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/cierre_caja`), orderBy('fecha', 'desc')) : null
    , [firestore, sucursalId]);
    const { data: cierres } = useCollection<CierreCaja>(cierresQuery);

    // 3. Consulta de pagos según el período seleccionado
    const pagosQuery = useMemoFirebase(() => {
        if (!firestore || !sucursalId) return null;
        
        const baseQuery = collection(firestore, `sucursales/${sucursalId}/pagos`);
        
        if (periodoFiltro === 'todos') {
            return query(baseQuery, orderBy('fecha', 'desc'));
        } 
        
        if (periodoFiltro === 'actual') {
            if (!estadoCaja?.fechaInicioPeriodo) return null;
            return query(baseQuery, where('fecha', '>=', estadoCaja.fechaInicioPeriodo), orderBy('fecha', 'desc'));
        }

        // Turno específico seleccionado por ID de cierre
        const cierre = cierres?.find(c => c.id === periodoFiltro);
        if (!cierre) return null;
        return query(
            baseQuery, 
            where('fecha', '>=', cierre.inicioDelPeriodo), 
            where('fecha', '<=', cierre.fecha),
            orderBy('fecha', 'desc')
        );
    }, [firestore, sucursalId, periodoFiltro, estadoCaja?.fechaInicioPeriodo, cierres]);

    const { data: rawPagos, isLoading: cargandoPagos, error } = useCollection<Pago>(pagosQuery);
    
    const pagosConDocId = useMemo((): PagoConDocId[] => {
        return (rawPagos || []).map(p => ({ ...p, id: p.id }));
    }, [rawPagos]);
    
    const pagosFiltrados = useMemo(() => {
        if (!filtro) return pagosConDocId;
        const f = filtro.toLowerCase();
        return pagosConDocId.filter(p => 
            p.clienteNombre.toLowerCase().includes(f) ||
            String(p.idVenta).includes(f) ||
            String(p.idPago).includes(f)
        );
    }, [pagosConDocId, filtro]);

    const totalPages = Math.ceil(pagosFiltrados.length / itemsPerPage);

    const paginatedPagos = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return pagosFiltrados.slice(start, start + itemsPerPage);
    }, [pagosFiltrados, currentPage, itemsPerPage]);

    useEffect(() => {
      setCurrentPage(1);
    }, [itemsPerPage, filtro, periodoFiltro]);

    if (error) {
        return (
            <div className="text-center text-destructive p-4 font-body">
                <p className="font-bold">Error al cargar los pagos:</p>
                <p className="text-sm">{error.message}</p>
            </div>
        )
    }

    const isLoading = isLoadingSucursal || cargandoPagos || (periodoFiltro === 'actual' && cargandoEstadoCaja);

    return (
        <div className="space-y-6">
            <EncabezadoPagos />
            
            <ListaPagos 
                pagos={paginatedPagos}
                cargando={isLoading}
                filtro={filtro}
                onFiltroChange={setFiltro}
                periodoFiltro={periodoFiltro}
                onPeriodoFiltroChange={setPeriodoFiltro}
                cierres={cierres || []}
                paginacion={{
                    paginaActual: currentPage,
                    itemsPorPagina: itemsPerPage,
                    totalPaginas: totalPages,
                    onPaginaChange: setCurrentPage,
                    onItemsPorPaginaChange: setItemsPerPage
                }}
            />
        </div>
    );
}
