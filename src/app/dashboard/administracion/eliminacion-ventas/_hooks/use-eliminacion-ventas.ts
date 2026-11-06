'use client'

import { useState } from 'react'
import { useFirebase } from '@/firebase'
import { useSucursal } from '@/hooks/use-sucursal'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'
import { eliminarVentasPorRango } from '@/lib/firebase/servicios/ventas-mantenimiento'

export function useEliminacionVentas() {
  const { firestore } = useFirebase()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()
  const { hasPermission, isLoading: isLoadingPerms } = usePermissions()
  const { toast } = useToast()

  // Estados de configuración
  const [desdeId, setDesdeId] = useState<number | ''>('')
  const [hastaId, setHastaId] = useState<number | ''>('')
  const [excluirCredito, setExcluirCredito] = useState(true)
  const [excluirPendientes, setExcluirPendientes] = useState(true)

  // Estados de control
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [resultado, setResultado] = useState<{ total: number } | null>(null)

  const manejarEliminacion = async () => {
    if (!firestore || !sucursalId || desdeId === '' || hastaId === '') return

    setProcesando(true)
    setProgreso(0)
    setResultado(null)

    try {
      const total = await eliminarVentasPorRango(
        firestore,
        sucursalId,
        Number(desdeId),
        Number(hastaId),
        excluirCredito,
        excluirPendientes,
        (p) => setProgreso(p)
      )

      setResultado({ total })
      toast({
        title: "Proceso completado",
        description: `Se han eliminado ${total} registros de ventas exitosamente.`
      })
      setDesdeId('')
      setHastaId('')
    } catch (error: any) {
      toast({
        title: "Error en mantenimiento",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setProcesando(false)
      setConfirmacionAbierta(false)
    }
  }

  const tienePermiso = hasPermission('reportes.eliminar_rango') || hasPermission('ventas.eliminar_rango')
  const cargandoPermisos = isLoadingSucursal || isLoadingPerms
  const puedeEjecutar = desdeId !== '' && hastaId !== '' && Number(hastaId) >= Number(desdeId)

  return {
    cargandoPermisos,
    tienePermiso,
    desdeId,
    setDesdeId,
    hastaId,
    setHastaId,
    excluirCredito,
    setExcluirCredito,
    excluirPendientes,
    setExcluirPendientes,
    procesando,
    progreso,
    confirmacionAbierta,
    setConfirmacionAbierta,
    resultado,
    puedeEjecutar,
    manejarEliminacion,
  }
}
