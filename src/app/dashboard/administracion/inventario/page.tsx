'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Producto, DetalleAjusteInventario } from '@/lib/tipos';
import { useToast } from '@/hooks/use-toast';
import { realizarAjusteInventario } from '@/lib/firebase/servicios/inventario';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputNumero } from '@/components/ui/input-numero';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Boxes, Search, AlertTriangle, Save, ClipboardCheck, ChevronLeft, ChevronRight, History, Pencil, ArrowLeft, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSucursal } from '@/hooks/use-sucursal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionGuard } from '@/components/permission-guard';

type ProductoConAjuste = Producto & {
  existenciaFisica: number | '';
  diferencia: number;
};

export default function PaginaInventario() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [productosAjuste, setProductosAjuste] = useState<ProductoConAjuste[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [filtro, setFiltro] = useState('');
  const [orden, setOrden] = useState('nombre-asc');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas');
  const [alertaGuardado, setAlertaGuardado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirmadoCheck, setConfirmadoCheck] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const productosQuery = useMemoFirebase(() => 
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/productos`), orderBy('nombre')) : null,
    [firestore, sucursalId]
  );
  const { data: productos, isLoading: cargandoProductos } = useCollection<Producto>(productosQuery);

  useEffect(() => {
    if (productos) {
      setProductosAjuste(
        productos.map(p => ({
          ...p,
          existenciaFisica: '',
          diferencia: 0,
        }))
      );
    }
  }, [productos]);

  const handleExistenciaFisicaChange = (productoId: string, valor: string) => {
    const valorNumerico = valor === '' ? '' : Number(valor);
    setProductosAjuste(prev =>
      prev.map(p => {
        if (p.id === productoId) {
          const sistema = p.existencia || 0;
          const diferencia = valorNumerico === '' ? 0 : valorNumerico - sistema;
          return { ...p, existenciaFisica: valorNumerico, diferencia };
        }
        return p;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const ubicacionesDisponibles = useMemo(() => {
    const set = new Set<string>();
    (productos || []).forEach(p => {
      if (p.ubicacion && p.ubicacion.trim()) set.add(p.ubicacion.trim());
    });
    if (set.size === 0) {
      ['Estantes', 'Refris', 'Congeladores', 'Mostrador', 'Bodega'].forEach(s => set.add(s));
    }
    return Array.from(set);
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let result = [...productosAjuste];
    if (filtro) {
      const filtroLower = filtro.toLowerCase();
      result = result.filter(p => p.nombre.toLowerCase().includes(filtroLower));
    }
    if (ubicacionFiltro !== 'todas') {
      if (ubicacionFiltro === 'sin_ubicacion') {
        result = result.filter(p => !p.ubicacion || !p.ubicacion.trim());
      } else {
        result = result.filter(p => (p.ubicacion || '').toLowerCase() === ubicacionFiltro.toLowerCase());
      }
    }
    
    if (orden === 'nombre-asc') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'nombre-desc') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'stock-asc') result.sort((a, b) => (a.existencia || 0) - (b.existencia || 0));
    if (orden === 'stock-desc') result.sort((a, b) => (b.existencia || 0) - (a.existencia || 0));
    
    return result;
  }, [productosAjuste, filtro, orden, ubicacionFiltro]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const paginatedProductos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [productosFiltrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, orden, itemsPerPage, isRevisionMode, ubicacionFiltro]);

  const manejarGuardarAjuste = async () => {
    if (!firestore || !user || !sucursalId) return;

    const productosParaAjustar = productosAjuste.filter(p => p.existenciaFisica !== '' && p.existenciaFisica !== p.existencia);

    if (productosParaAjustar.length === 0) {
      toast({ title: "Sin cambios", description: "No se han ingresado nuevas existencias físicas." });
      return;
    }
    
    setProcesando(true);

    const detalles: DetalleAjusteInventario[] = productosParaAjustar.map(p => ({
      productoId: p.id,
      nombreProducto: p.nombre,
      existenciaSistema: p.existencia,
      existenciaFisica: Number(p.existenciaFisica),
      diferencia: p.diferencia,
    }));

    try {
      await realizarAjusteInventario(firestore, sucursalId, {
        fecha: new Date(),
        usuarioId: user.uid,
        observaciones,
        detalles,
      });

      toast({ title: "Éxito", description: "El ajuste de inventario se ha guardado correctamente." });
      setObservaciones('');
      setConfirmadoCheck(false);
      setIsRevisionMode(false);
    } catch (error) {
      console.error("Error guardando ajuste:", error);
      toast({ title: "Error", description: "No se pudo guardar el ajuste.", variant: "destructive" });
    } finally {
      setProcesando(false);
      setAlertaGuardado(false);
    }
  };

  if (isLoadingSucursal || cargandoProductos) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-6 font-body">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2">
            {!isRevisionMode ? <Boxes className="h-6 w-6 text-primary"/> : <Pencil className="h-6 w-6 text-primary" />}
            {!isRevisionMode ? "Control de inventario" : "Revisión de Inventario"}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {!isRevisionMode 
              ? "Administra las existencias físicas y realiza ajustes de inventario para mantener el stock actualizado."
              : "Realiza el conteo físico del stock y registra los ajustes necesarios."}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          {!isRevisionMode ? (
            <PermissionGuard permission="inventario.revisar">
              <Button onClick={() => setIsRevisionMode(true)} className="w-auto rounded-full font-medium">
                <ClipboardCheck className="mr-2 h-4 w-4" /> Hacer revisión
              </Button>
            </PermissionGuard>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setIsRevisionMode(false)} className="flex-1 sm:w-auto rounded-full font-medium">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Regresar
                </Button>
                <Button variant="outline" asChild className="flex-1 sm:w-auto rounded-full font-medium">
                    <Link href="/dashboard/administracion/inventario/historial">
                        <History className="mr-2 h-4 w-4" />
                        Historial
                    </Link>
                </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-border bg-card overflow-hidden">
        <CardHeader className="p-4 bg-muted/5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar producto..."
                className="pl-9 rounded-full h-10 border-muted-foreground/20"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={ubicacionFiltro} onValueChange={setUbicacionFiltro}>
                <SelectTrigger className="w-full sm:w-[170px] rounded-full h-10 border-muted-foreground/20">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Ubicación..." />
                </SelectTrigger>
                <SelectContent className="font-body">
                  <SelectItem value="todas">Todas las ubicaciones</SelectItem>
                  {ubicacionesDisponibles.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                  <SelectItem value="sin_ubicacion">Sin ubicación</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orden} onValueChange={setOrden}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full h-10 border-muted-foreground/20">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent className="font-body">
                  <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="stock-asc">Stock (Menor a Mayor)</SelectItem>
                  <SelectItem value="stock-desc">Stock (Mayor a Menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {!isRevisionMode ? (
            /* Vista de Control (Modo Lectura) */
            <div className="space-y-3">
              {paginatedProductos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed">
                  <Search className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-semibold text-lg">No se encontraron productos</p>
                  <p className="text-sm">Intenta con otro término de búsqueda.</p>
                </div>
              ) : (
                paginatedProductos.map((p) => {
                  const esStockBajo = p.existenciaMinima !== undefined && p.existencia <= p.existenciaMinima;
                  return (
                    <div key={p.id} className={cn(
                      "flex items-center justify-between gap-4 p-4 rounded-lg border border-border transition-all",
                      esStockBajo ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800" : "bg-card-foreground/5"
                    )}>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate text-foreground">{p.nombre}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge className={cn(
                            "rounded-full px-3 py-0.5 text-[10px] font-bold border-none",
                            esStockBajo ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                          )}>
                            {esStockBajo ? 'Bajo' : 'En stock'}
                          </Badge>
                          {p.ubicacion && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-[10px] font-bold text-primary rounded-full">
                              <MapPin className="h-2.5 w-2.5" />
                              {p.ubicacion}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-lg font-bold tabular-nums">{p.existencia}</span>
                            <span className="text-muted-foreground font-normal mx-0.5">/</span>
                            <span className="text-muted-foreground font-normal">{p.existenciaMinima || 0}</span>
                          </div>
                          <p className="text-[9px] font-medium text-muted-foreground leading-none tracking-tight">Stock / Mín.</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Vista de Revisión (Modo Edición) */
            <div className="space-y-6">
              <div className="space-y-2">
                {paginatedProductos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                    <p>No se encontraron productos para revisar.</p>
                  </div>
                ) : (
                  paginatedProductos.map((p, index) => (
                    <div key={p.id} className={cn(
                      "flex items-center justify-between p-4 rounded-lg border border-border transition-all",
                      p.existenciaFisica !== '' ? "border-primary bg-primary/10" : "bg-card-foreground/5"
                    )}>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base text-foreground truncate block">
                          {p.nombre}
                        </span>
                        {p.ubicacion && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary mt-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {p.ubicacion}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <InputNumero 
                            data-index={index}
                            value={p.existenciaFisica}
                            onChange={(e) => handleExistenciaFisicaChange(p.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="h-10 w-24 text-center font-semibold text-sm rounded-full"
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                          / {p.existencia}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Panel de Finalización de Revisión */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-[10px] font-semibold tracking-widest text-muted-foreground ml-1">Observaciones del ajuste</Label>
                  <Textarea 
                    id="observaciones"
                    placeholder="Describe cualquier novedad detectada en el conteo..."
                    className="rounded-xl resize-none min-h-[80px] text-sm"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id="confirmar-aplicar" 
                    checked={confirmadoCheck} 
                    onCheckedChange={(checked) => setConfirmadoCheck(!!checked)} 
                  />
                  <Label htmlFor="confirmar-aplicar" className="text-sm cursor-pointer font-medium">
                    Confirmo que deseo aplicar los cambios en el inventario
                  </Label>
                </div>

                <Button 
                  onClick={() => setAlertaGuardado(true)} 
                  disabled={procesando || !confirmadoCheck || productosAjuste.every(p => p.existenciaFisica === '' || p.existenciaFisica === p.existencia)}
                  className="w-full rounded-full font-medium"
                >
                  {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Aplicar ajustes de inventario
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer con Paginación */}
        {totalPages > 1 && (
          <CardFooter className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between bg-muted/5">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-muted-foreground">Filas por página</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs rounded-full">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-center space-x-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Anterior</span>
              </Button>
              <div className="flex-shrink-0 text-xs font-semibold text-muted-foreground tracking-tighter px-2">
                Pág. {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-full"
              >
                <span className="text-xs">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Alerta de Confirmación */}
      <AlertDialog open={alertaGuardado} onOpenChange={setAlertaGuardado}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              ¿Confirmar ajustes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Esta acción actualizará permanentemente las existencias en el sistema basándose en tu conteo físico. Se generará un registro en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium rounded-full">Volver a revisar</AlertDialogCancel>
            <AlertDialogAction onClick={manejarGuardarAjuste} className="bg-primary font-semibold rounded-full">Sí, aplicar cambios</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
