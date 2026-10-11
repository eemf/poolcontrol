import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center font-body bg-background">
      <h2 className="text-2xl font-bold font-headline mb-2 text-foreground">Página no encontrada</h2>
      <p className="text-sm text-muted-foreground mb-6">La página que buscas no existe o ha sido movida.</p>
      <Button asChild className="rounded-full px-6">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
