'use client'

import { useState, useMemo, FormEvent } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { guardarCuenta, eliminarCuenta } from '@/lib/firebase/servicios/cuentas';
import { useToast } from '@/hooks/use-toast';
import type { Cuenta } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, BookUser, PlusCircle, Search, Edit, Trash2, Banknote, Landmark, X, Save } from 'lucide-react';
import { InputNumero } from '@/components/ui/input-numero';
import { useSucursal } from '@/hooks/use-sucursal';

type CuentaConId = Cuenta & { id: string };

export default function CuentasPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaConId | null>(null);
  const [cuentaToDelete, setCuentaToDelete] = useState<CuentaConId | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formState, setFormState] = useState<{
    nombre: string;
    tipo: 'Efectivo' | 'Bancaria';
    saldo: number | '';
  }>({
    nombre: '',
    tipo: 'Efectivo',
    saldo: 0,
  });

  const cuentasQuery = useMemoFirebase(() => {
    if (!firestore || !user || !sucursalId) return null;
    return query(collection(firestore, `sucursales/${sucursalId}/cuentas`), orderBy('nombre'));
  }, [firestore, user, sucursalId]);

  const { data: cuentasData, isLoading, error } = useCollection<Cuenta>(cuentasQuery);

  const cuentas: CuentaConId[] = useMemo(() => 
    (cuentasData || []).map(c => ({...c, id: c.id}))
  , [cuentasData]);
  
  const filteredCuentas = useMemo(() => {
    if (!searchTerm) return cuentas;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return cuentas.filter(c => 
        c.nombre.toLowerCase().includes(lowerCaseSearch) ||
        c.tipo.toLowerCase().includes(lowerCaseSearch)
    );
  }, [cuentas, searchTerm]);

  const handleOpenModal = (cuenta: CuentaConId | null) => {
    if (cuenta) {
      setEditingCuenta(cuenta);
      setFormState({ nombre: cuenta.nombre, tipo: cuenta.tipo, saldo: cuenta.saldo });
    } else {
      setEditingCuenta(null);
      setFormState({ nombre: '', tipo: 'Efectivo', saldo: 0 });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !sucursalId) return;
    if (!formState.nombre || formState.saldo === '') {
        toast({ title: "Error", description: "El nombre y el saldo son obligatorios.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
        await guardarCuenta(
            firestore, 
            sucursalId, 
            { ...formState, saldo: Number(formState.saldo) }, 
            editingCuenta?.id
        );
        toast({ title: "Éxito", description: `Cuenta ${editingCuenta ? 'actualizada' : 'creada'} correctamente.` });
        setIsModalOpen(false);
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "No se pudo guardar la cuenta.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!firestore || !cuentaToDelete || !sucursalId) return;
    setLoading(true);
    try {
        await eliminarCuenta(firestore, sucursalId, cuentaToDelete.id);
        toast({ title: "Éxito", description: "La cuenta ha sido eliminada." });
        setCuentaToDelete(null);
    } catch(error: any) {
        toast({ title: "Error", description: error.message || "No se pudo eliminar la cuenta.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="space-y-6 font-body">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <BookUser className="h-6 w-6 text-primary" />
                    Cuentas financieras
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Administra las cuentas de efectivo y bancarias de tu negocio.</p>
            </div>
            <Button onClick={() => handleOpenModal(null)} className="w-full sm:w-auto rounded-full font-medium h-11">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Cuenta
            </Button>
        </div>

        <Card className="border bg-card shadow-sm overflow-hidden">
            <CardHeader className="p-4 bg-muted/5">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por nombre o tipo..."
                        className="pl-9 rounded-full h-10 border-muted-foreground/20 bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {isLoading || isLoadingSucursal ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : filteredCuentas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-3xl bg-muted/5 m-2">
                        <BookUser className="h-12 w-12 mb-4 text-primary/30" />
                        <p className="font-semibold text-lg">{searchTerm ? "No se encontraron cuentas" : "No hay cuentas registradas"}</p>
                        <p className="text-xs mt-1">{searchTerm ? "Intenta con otra búsqueda." : "Crea tu primera cuenta para empezar."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {filteredCuentas.map(cuenta => (
                            <Card key={cuenta.id} className="border bg-card-foreground/5 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                                <CardHeader className="pb-2 bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        {cuenta.tipo === 'Efectivo' ? <Banknote className="h-5 w-5 text-emerald-600"/> : <Landmark className="h-5 w-5 text-blue-600"/>}
                                        <CardTitle className="text-lg font-bold">{cuenta.nombre}</CardTitle>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{cuenta.tipo}</p>
                                </CardHeader>
                                <CardContent className="text-center py-6">
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Saldo Actual</p>
                                    <p className="text-3xl font-black text-primary tabular-nums">Q{cuenta.saldo.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 p-3 bg-muted/5 border-t border-dashed">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-4" 
                                        onClick={() => handleOpenModal(cuenta)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 text-white bg-destructive hover:bg-destructive/90 rounded-full font-bold px-4" 
                                        onClick={() => setCuentaToDelete(cuenta)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl font-body border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl">{editingCuenta ? "Editar Cuenta" : "Nueva Cuenta"}</DialogTitle>
                        <DialogDescription className="text-xs">Completa la información para gestionar tus finanzas.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground ml-1">Nombre de la cuenta</Label>
                            <Input id="nombre" value={formState.nombre} onChange={(e) => setFormState(p => ({...p, nombre: e.target.value}))} required className="rounded-full h-11 border-muted-foreground/20" placeholder="Ej: Caja Chica" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="text-xs font-semibold text-muted-foreground ml-1">Tipo</Label>
                                <Select value={formState.tipo} onValueChange={(value: 'Efectivo' | 'Bancaria') => setFormState(p => ({...p, tipo: value}))}>
                                    <SelectTrigger className="rounded-full h-11 border-muted-foreground/20"><SelectValue/></SelectTrigger>
                                    <SelectContent className="font-body">
                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                        <SelectItem value="Bancaria">Bancaria</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="saldo" className="text-xs font-semibold text-muted-foreground ml-1">Saldo inicial</Label>
                                <InputNumero id="saldo" value={formState.saldo} onChange={(e) => setFormState(p => ({...p, saldo: e.target.value === '' ? '' : Number(e.target.value)}))} required className="rounded-full h-11 text-center font-bold text-lg" onFocus={(e) => e.target.select()} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-full h-11 px-8 font-semibold">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto rounded-full h-11 px-10 font-bold shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            {editingCuenta ? "Actualizar" : "Guardar Cuenta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!cuentaToDelete} onOpenChange={(open) => !open && setCuentaToDelete(null)}>
            <AlertDialogContent className="rounded-3xl font-body border-none shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-xl text-destructive flex items-center gap-2">
                        <Trash2 className="h-6 w-6" /> ¿Confirmas la eliminación?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">Esta acción es permanente. La cuenta <span className="font-bold text-foreground">"{cuentaToDelete?.nombre}"</span> será eliminada de tus registros.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                    <AlertDialogCancel className="rounded-full h-11 px-8 font-semibold">Volver</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-full h-11 px-10 font-bold">Eliminar definitivamente</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
