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
        const detallesPromises = ids.map(id => {
          const docRef = doc(firestore, `sucursales/${sucursalId}/cuadre_semanal`, id)
          return getDoc(docRef)
        })

        const docsSnapshots = await Promise.all(detallesPromises)
        const fetchedDetalles = docsSnapshots
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CuadreSemanalConId))

        setDetalles(fetchedDetalles)
      } catch (err) {
        console.error("Error al cargar cuadres semanales:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetalles()
  }, [ids, firestore, sucursalId])

  if (!ids || ids.length === 0) return null

  return (
    <div>
      <h4 className="font-semibold mb-2 text-xs text-slate-300">
        Cuadres Semanales Incluidos ({ids.length})
      </h4>
      {isLoading ? (
        <div className="flex justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {detalles.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center text-xs p-2.5 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]"
            >
              <div>
                <p className="font-semibold text-white truncate max-w-44">
                  Cuadre Semanal #{item.idCuadreSemanal}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {format(item.fecha.toDate(), "dd/MM/yy hh:mm a", { locale: es })}
                </p>
              </div>
              <p className="font-bold text-sky-400">
                Q{(item.resumen.balanceLiquidado ?? 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
