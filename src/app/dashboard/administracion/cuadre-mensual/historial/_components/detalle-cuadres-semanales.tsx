'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, Firestore } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CuadreSemanal } from '@/lib/tipos'

type CuadreSemanalConId = CuadreSemanal & { id: string }

interface DetalleCuadresSemanalesProps {
  ids: string[]
  firestore: Firestore
  sucursalId: string | null
}

export function DetalleCuadresSemanales({ ids, firestore, sucursalId }: DetalleCuadresSemanalesProps) {
  const [detalles, setDetalles] = useState<CuadreSemanalConId[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ids || ids.length === 0 || !sucursalId) {
      setDetalles([])
      return
    }

    const fetchDetalles = async () => {
      setIsLoading(true)
      try {
        const docsSnapshots = await Promise.all(
          ids.map(id => getDoc(doc(firestore, `sucursales/${sucursalId}/cuadre_semanal`, id)))
        )
        setDetalles(
          docsSnapshots
            .filter(docSnap => docSnap.exists())
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CuadreSemanalConId))
        )
      } catch (err) {
        console.error('Error al cargar cuadres semanales:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetalles()
  }, [ids, firestore, sucursalId])

  if (!ids || ids.length === 0) return null

  return (
    <div className="rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] overflow-hidden">
      <div className="px-2.5 py-1.5 bg-[#1e1e1e] border-b border-[#2e2e2e] flex items-center justify-between text-[11px] font-semibold text-slate-300">
        <span>Cuadres Semanales Incluidos</span>
        <span className="text-slate-400 tabular-nums">{ids.length}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : (
        <div className="divide-y divide-[#2e2e2e]">
          {detalles.map(item => (
            <div key={item.id} className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs hover:bg-[#313131]/50 transition-colors">
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium text-slate-100 truncate">
                  Cuadre Semanal #{item.idCuadreSemanal}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                  {format(item.fecha.toDate(), 'dd/MM hh:mm a', { locale: es })}
                </span>
              </div>
              <span className="font-bold text-sky-400 tabular-nums shrink-0">
                Q{(item.resumen.balanceLiquidado ?? 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
