'use client';

import { useState, useRef, useMemo } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { procesarVentaRapidaConId } from '@/lib/firebase/servicios';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Producto, ProductoVirtual } from '@/lib/tipos';
import { analizarComando, type ComandoAnalizado } from '@/lib/utils/analizar-comando';
import { collection } from 'firebase/firestore';
import { useSucursal } from '@/hooks/use-sucursal';


export default function QuickDispatchInput() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const { toast } = useToast();
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

    // Cargar todos los productos (físicos y virtuales) una vez
    const productosFisicosQuery = useMemoFirebase(() => 
        (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/productos`) : null, 
        [firestore, sucursalId]
    );
    const { data: productosFisicos, isLoading: isLoadingProductos } = useCollection<Producto>(productosFisicosQuery);

    const productosVirtualesQuery = useMemoFirebase(() => 
        (firestore && sucursalId) ? collection(firestore, `sucursales/${sucursalId}/productos_virtuales`) : null, 
        [firestore, sucursalId]
    );
    const { data: productosVirtuales, isLoading: isLoadingVirtuales } = useCollection<ProductoVirtual>(productosVirtualesQuery);

    const handleDispatch = async () => {
        if (!inputValue.trim() || !firestore || !user || !productosFisicos || !productosVirtuales || !sucursalId) return;
        setLoading(true);

        try {
            const comando: ComandoAnalizado = analizarComando(inputValue);
            
            // Lógica de búsqueda en el frontend
            let productoEncontrado: (Producto | ProductoVirtual) & { esVirtual: boolean } | null = null;
            const terminoBusqueda = comando.nombreProducto.toLowerCase();

            // 1. Buscar coincidencia exacta en `codigoBusqueda` (más prioritario)
            const virtualMatchByCode = productosVirtuales.find(p => p.codigoBusqueda?.toLowerCase() === terminoBusqueda);
            if (virtualMatchByCode) {
                productoEncontrado = { ...virtualMatchByCode, esVirtual: true };
            } else {
                const fisicoMatchByCode = productosFisicos.find(p => p.codigoBusqueda?.toLowerCase() === terminoBusqueda);
                if (fisicoMatchByCode) {
                    productoEncontrado = { ...fisicoMatchByCode, esVirtual: false };
                }
            }
            
            // 1.5 Lógica de respaldo para "moneda-virtual" si el codigoBusqueda no está configurado
            if (!productoEncontrado && terminoBusqueda === 'moneda-virtual') {
                const monedaMatchByName = productosVirtuales.find(p => p.nombre.toLowerCase() === 'monedas');
                if (monedaMatchByName) {
                    productoEncontrado = { ...monedaMatchByName, esVirtual: true };
                }
            }

            // 2. Si no se encuentra por código, buscar por nombre (más flexible)
            if (!productoEncontrado) {
                const virtualMatchByName = productosVirtuales.find(p => p.nombre.toLowerCase().includes(terminoBusqueda));
                if (virtualMatchByName) {
                    productoEncontrado = { ...virtualMatchByName, esVirtual: true };
                } else {
                    const fisicoMatchByName = productosFisicos.find(p => 
                        p.nombre.toLowerCase().includes(terminoBusqueda)
                    );
                    if (fisicoMatchByName) {
                        productoEncontrado = { ...fisicoMatchByName, esVirtual: false };
                    }
                }
            }
           
            if (!productoEncontrado) {
                throw new Error(`Producto no encontrado para: "${comando.nombreProducto}"`);
            }

            const resultado = await procesarVentaRapidaConId(
                firestore, 
                sucursalId, 
                user.uid, 
                comando,
                productoEncontrado.id,
                productoEncontrado as Producto | ProductoVirtual,
                productoEncontrado.esVirtual
            );

            // Generar descripción detallada con rastro de stock
            const stockMain = resultado.stockInfo.producto;
            let infoDetallada = `${resultado.cantidad}x ${resultado.nombreProducto} (Q${resultado.totalVenta.toFixed(2)}). Stock: ${stockMain.inicial} → ${stockMain.final}`;
            
            if (resultado.stockInfo.ingredientes.length > 0) {
                const ingInfo = resultado.stockInfo.ingredientes.map(i => `${i.nombre}: ${i.inicial} → ${i.final}`).join(' | ');
                infoDetallada += ` | Ingredientes: ${ingInfo}`;
            }

            toast({
                variant: 'success',
                title: 'Venta Rápida Exitosa',
                description: infoDetallada,
            });
            setInputValue('');

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error en Venta Rápida',
                description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.',
            });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };
    
    const isLoading = isLoadingProductos || isLoadingVirtuales || isLoadingSucursal;

    return (
        <div className={cn(
            "relative w-full max-w-sm items-center flex h-9 rounded-full border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}>
             <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
             <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleDispatch();
                    }
                }}
                placeholder={isLoading ? "Cargando productos..." : "ej: 3*coca*p1"}
                className="pl-9 pr-20 h-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={loading || isLoading}
             />
             <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                onClick={handleDispatch}
                disabled={loading || isLoading || !inputValue}
            >
                {loading || isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vender'}
            </Button>
        </div>
    );
}
