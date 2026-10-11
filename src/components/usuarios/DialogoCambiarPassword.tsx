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
import { Eye, EyeOff, KeyRound, Loader2, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useUser } from '@/firebase';
import {
  cambiarPasswordUsuario,
  enviarCorreoRestablecimiento,
} from '@/lib/firebase/servicios/usuarios-auth';

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
  const [cargandoEmail, setCargandoEmail] = useState(false);
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
            'Para cambio directo se requieren credenciales de servicio en local. Puedes usar el botón de abajo para enviarle un enlace de restablecimiento al correo.'
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

  const handleEnviarEmail = async () => {
    if (!usuario?.email) return;

    setCargandoEmail(true);
    setErrorLocal(null);

    try {
      const resultado = await enviarCorreoRestablecimiento(auth, usuario.email);
      if (resultado.ok) {
        toast({
          title: 'Enlace enviado',
          description: resultado.message,
        });
        resetFormulario();
        onOpenChange(false);
        onSuccess?.();
      } else {
        setErrorLocal(resultado.message);
        toast({
          variant: 'destructive',
          title: 'Error al enviar enlace',
          description: resultado.message,
        });
      }
    } finally {
      setCargandoEmail(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-md rounded-3xl font-body border-none shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-headline text-lg font-bold">
                Modificar contraseña
              </DialogTitle>
              <DialogDescription className="text-xs font-body text-muted-foreground">
                Usuario: <span className="font-semibold text-foreground">{usuario.nombre}</span> ({usuario.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleActualizarPassword} className="space-y-4 pt-2">
          {errorLocal && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-2xl border border-destructive/20 flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorLocal}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="nueva-password" className="text-xs font-semibold ml-1">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="nueva-password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="rounded-full h-11 pr-10 border-muted-foreground/20"
                disabled={cargandoDirecto || cargandoEmail}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-muted-foreground hover:bg-transparent"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-password" className="text-xs font-semibold ml-1">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmar-password"
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="rounded-full h-11 pr-10 border-muted-foreground/20"
                disabled={cargandoDirecto || cargandoEmail}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={cargandoDirecto || cargandoEmail || !nuevaPassword}
              className="w-full rounded-full h-11 font-bold shadow-md shadow-primary/20 gap-2"
            >
              {cargandoDirecto ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando contraseña...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Guardar nueva contraseña
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dashed border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
            <span className="bg-background px-2 text-muted-foreground">O envía un enlace</span>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            disabled={cargandoDirecto || cargandoEmail}
            onClick={handleEnviarEmail}
            className="w-full rounded-full h-10 text-xs font-medium gap-2 border-muted-foreground/20 hover:bg-primary/5"
          >
            {cargandoEmail ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Enviando correo...
              </>
            ) : (
              <>
                <Mail className="h-3.5 w-3.5 text-primary" />
                Enviar enlace de restablecimiento al correo
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleCerrar(false)}
            disabled={cargandoDirecto || cargandoEmail}
            className="w-full rounded-full text-xs text-muted-foreground"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
