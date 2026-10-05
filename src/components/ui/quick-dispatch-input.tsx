
'use client';

import { useState, useRef, useMemo } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { procesarVentaRapidaConId, registrarCacheUsuario } from '@/lib/firebase/servicios';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Producto, ProductoVirtual } from '@/lib/tipos';
import { analizarComando, type ComandoAnalizado } from '@/lib/utils/analizar-comando';
import { collection } from 'firebase/firestore';
import { useSucursal } from '@/hooks/use-sucursal';
import { useEffect } from 'react';

export default function QuickDispatchInput() {
    const { firestore } = useFirebase();
    const { user, profile } = useUser();
    const { toast } = useToast();
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

    useEffect(() => {
        if (user) {
            registrarCacheUsuario(user.uid, {
                nombre: profile?.nombre || user.displayName || user.email || 'Operador',
                email: user.email || '',
                rol: profile?.rol || 'Operador',
            });
        }
    }, [user, profile]);

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

        console.log('[Venta Rápida Debug] Iniciando despacho...');
        console.log(`[Venta Rápida Debug] Input: "${inputValue}"`);

        try {
            const comando: ComandoAnalizado = analizarComando(inputValue);
            console.log('[Venta Rápida Debug] Comando analizado:', comando);
            
            // Lógica de búsqueda en el frontend
            let productoEncontrado: (Producto | ProductoVirtual) & { esVirtual: boolean } | null = null;
            const terminoBusqueda = comando.nombreProducto.toLowerCase();
            console.log(`[Venta Rápida Debug] Término de búsqueda: "${terminoBusqueda}"`);
            
            console.log('[Venta Rápida Debug] Productos virtuales cargados:', productosVirtuales);

            // 1. Buscar coincidencia exacta en `codigoBusqueda` (más prioritario)
            const virtualMatchByCode = productosVirtuales.find(p => p.codigoBusqueda?.toLowerCase() === terminoBusqueda);
            if (virtualMatchByCode) {
                console.log('[Venta Rápida Debug] Encontrado producto VIRTUAL por código:', virtualMatchByCode);
                productoEncontrado = { ...virtualMatchByCode, esVirtual: true };
            } else {
                const fisicoMatchByCode = productosFisicos.find(p => p.codigoBusqueda?.toLowerCase() === terminoBusqueda);
                if (fisicoMatchByCode) {
                    console.log('[Venta Rápida Debug] Encontrado producto FÍSICO por código:', fisicoMatchByCode);
                    productoEncontrado = { ...fisicoMatchByCode, esVirtual: false };
                }
            }
            
            // 1.5 Lógica de respaldo para "moneda-virtual" si el codigoBusqueda no está configurado
            if (!productoEncontrado && terminoBusqueda === 'moneda-virtual') {
                console.log('[Venta Rápida Debug] Respaldo: buscando producto virtual por nombre "Monedas"');
                const monedaMatchByName = productosVirtuales.find(p => p.nombre.toLowerCase() === 'monedas');
                if (monedaMatchByName) {
                    console.log('[Venta Rápida Debug] Encontrado producto "Monedas" por nombre:', monedaMatchByName);
                    productoEncontrado = { ...monedaMatchByName, esVirtual: true };
                }
            }


            // 2. Si no se encuentra por código, buscar por nombre (más flexible)
            if (!productoEncontrado) {
                console.log('[Venta Rápida Debug] No se encontró por código, buscando por nombre...');
                const virtualMatchByName = productosVirtuales.find(p => p.nombre.toLowerCase().includes(terminoBusqueda));
                if (virtualMatchByName) {
                    console.log('[Venta Rápida Debug] Encontrado producto VIRTUAL por nombre:', virtualMatchByName);
                    productoEncontrado = { ...virtualMatchByName, esVirtual: true };
                } else {
                    const fisicoMatchByName = productosFisicos.find(p => 
                        p.nombre.toLowerCase().includes(terminoBusqueda)
                    );
                    if (fisicoMatchByName) {
                        console.log('[Venta Rápida Debug] Encontrado producto FÍSICO por nombre:', fisicoMatchByName);
                        productoEncontrado = { ...fisicoMatchByName, esVirtual: false };
                    }
                }
            }
           
            if (!productoEncontrado) {
                console.error('[Venta Rápida Debug] ¡PRODUCTO NO ENCONTRADO!');
                console.error('[Venta Rápida Debug] Lista de productos virtuales revisada:', productosVirtuales);
                console.error('[Venta Rápida Debug] Lista de productos físicos revisada:', productosFisicos);
                throw new Error(`Producto no encontrado para: "${comando.nombreProducto}"`);
            }

            console.log('[Venta Rápida Debug] Producto final encontrado:', productoEncontrado);

            const resultado = await procesarVentaRapidaConId(
                firestore, 
                sucursalId, 
                user.uid, 
                comando,
                productoEncontrado.id,
                productoEncontrado as Producto | ProductoVirtual,
                productoEncontrado.esVirtual
            );

            toast({
                title: 'Venta Rápida Exitosa',
                description: `${resultado.cantidad}x ${resultado.nombreProducto} por Q${resultado.totalVenta.toFixed(2)}`,
            });
            setInputValue('');

        } catch (error) {
            console.error("Error en venta rápida:", error);
            toast({
                variant: 'destructive',
                title: 'Error en Venta Rápida',
                description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.',
            });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
            console.log('[Venta Rápida Debug] Despacho finalizado.');
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
