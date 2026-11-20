'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser } from '@/firebase';
import { cambiarPasswordUsuario } from '@/lib/firebase/servicios/usuarios-auth';

interface UsuarioParaPassword {
  authUid: string;
  nombre: string;
  email: string;
}

interface DialogoCambiarPasswordProps {
  usuario: UsuarioParaPassword | null;
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
  onSuccess?: () => void;
}

export function DialogoCambiarPassword({
  usuario,
  abierto,
  onOpenChange,
  onSuccess,
}: DialogoCambiarPasswordProps) {
  const { auth } = useFirebase();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoDirecto, setCargandoDirecto] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const resetFormulario = () => {
    setNuevaPassword('');
    setConfirmarPassword('');
    setMostrarPassword(false);
    setErrorLocal(null);
  };

  const handleCerrar = (open: boolean) => {
    if (!open) {
      resetFormulario();
    }
    onOpenChange(open);
  };

  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setErrorLocal(null);

    if (nuevaPassword.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorLocal('Las contraseñas no coinciden. Por favor, revísalas.');
      return;
    }

    setCargandoDirecto(true);

    try {
      const resultado = await cambiarPasswordUsuario({
        authUid: usuario.authUid,
        email: usuario.email,
        nuevaPassword,
        currentUser,
        auth,
      });

      if (resultado.ok) {
        toast({
          title: 'Contraseña actualizada',
          description: `Se modificó la contraseña para ${usuario.nombre}.`,
        });
        resetFormulario();
        onOpenChange(false);
        onSuccess?.();
      } else {
        if (resultado.code === 'ADMIN_CREDENTIALS_NEEDED') {
          setErrorLocal(
            'Para cambio directo se requieren credenciales de servicio configuradas en el servidor.'
          );
        } else {
          setErrorLocal(resultado.message);
        }
        toast({
          variant: 'destructive',
          title: 'No se pudo actualizar',
          description: resultado.message,
        });
      }
    } finally {
      setCargandoDirecto(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-md bg-[#1e1e1e] border-[#2e2e2e] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xl font-body flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <DialogTitle className="font-headline text-lg font-bold text-slate-100 leading-tight truncate">
                Modificar contraseña
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                Usuario: <span className="font-semibold text-slate-200">{usuario.nombre}</span> ({usuario.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleActualizarPassword} className="space-y-3.5 pt-2">
          {errorLocal && (
            <div className="p-3 bg-rose-500/15 text-rose-300 text-xs rounded-xl border border-rose-500/30 flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorLocal}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="nueva-password" className="text-xs font-medium ml-1 text-slate-200 block">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="nueva-password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="rounded-full h-10 pr-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                disabled={cargandoDirecto}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-slate-400 hover:text-slate-200 hover:bg-[#313131]"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-password" className="text-xs font-medium ml-1 text-slate-200 block">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmar-password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="rounded-full h-10 pr-10 bg-[#252526] border-[#2e2e2e] text-sm text-slate-100 placeholder:text-slate-500"
                disabled={cargandoDirecto}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex-row items-center justify-between sm:justify-between gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleCerrar(false)}
              disabled={cargandoDirecto}
              className="rounded-full h-9 px-5 text-xs font-medium bg-[#252526] hover:bg-[#313131] text-slate-200 border border-[#2e2e2e]"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              disabled={cargandoDirecto || !nuevaPassword}
              className="rounded-full h-9 px-6 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md gap-2"
            >
              {cargandoDirecto ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
