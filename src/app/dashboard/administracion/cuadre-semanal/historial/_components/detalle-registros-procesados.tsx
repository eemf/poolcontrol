'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, Firestore } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DetalleRegistrosProcesadosProps {
  ids: string[]
  firestore: Firestore
  sucursalId: string | null
  tipo: 'movimiento' | 'compra' | 'gasto' | 'tragamonedas' | 'traslado'
  titulo: string
  campoMonto?: 'pagosTarjeta'
}

export function DetalleRegistrosProcesados({
  ids,
  firestore,
  sucursalId,
  tipo,
  titulo,
  campoMonto,
}: DetalleRegistrosProcesadosProps) {
  const [detalles, setDetalles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ids || ids.length === 0 || !sucursalId) {
      setDetalles([])
      return
    }

    const fetchDetalles = async () => {
      setIsLoading(true)
      try {
        const collectionMap = {
          movimiento: 'cierre_caja',
          compra: 'compras',
          gasto: 'gastos',
          tragamonedas: 'cuadre_tragamonedas',
        } as const

        const detallesPromises = ids.map(id => {
          const docRef = tipo === 'traslado'
            ? doc(firestore, 'traslados', id)
            : doc(firestore, `sucursales/${sucursalId}/${collectionMap[tipo]}`, id)
          return getDoc(docRef)
        })

        const docsSnapshots = await Promise.all(detallesPromises)
        setDetalles(
          docsSnapshots
            .filter(docSnap => docSnap.exists())
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        )
      } catch (err) {
        console.error('Error al cargar registros procesados:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetalles()
  }, [ids, firestore, tipo, sucursalId])

  if (!ids || ids.length === 0) return null

  return (
    <div className="rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] overflow-hidden">
      <div className="px-2.5 py-1.5 bg-[#1e1e1e] border-b border-[#2e2e2e] flex items-center justify-between text-[11px] font-semibold text-slate-300">
        <span>{titulo}</span>
        <span className="text-slate-400 tabular-nums">{ids.length}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : (
        <div className="divide-y divide-[#2e2e2e]">
          {detalles.map(item => {
            const fechaDoc = item.fecha || item.fechaEnvio
            const fechaStr = fechaDoc?.toDate ? format(fechaDoc.toDate(), 'dd/MM hh:mm a', { locale: es }) : 'N/A'
            const nombre =
              tipo === 'movimiento' ? `Cierre #${item.idCuadre}` :
              tipo === 'tragamonedas' ? `Tragamonedas #${item.idCuadre}` :
              tipo === 'traslado' ? `#TR-${item.idTraslado} → ${item.sucursalDestinoNombre}` :
              item.descripcion || item.proveedorNombre || `ID: ${item.id}`

            const monto = campoMonto === 'pagosTarjeta'
              ? (item.pagosTarjeta ?? 0)
              : ((item.totalLiquidado ?? item.pagosTarjeta ?? item.monto ?? item.montoTotal ?? item.gananciaATrasladar ?? item.costoTotalTraslado) ?? 0)

            return (
              <div key={item.id} className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs hover:bg-[#313131]/50 transition-colors">
                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-medium text-slate-100 truncate">{nombre}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{fechaStr}</span>
                </div>
                <span className="font-bold text-slate-100 tabular-nums shrink-0">
                  Q{Number(monto).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
