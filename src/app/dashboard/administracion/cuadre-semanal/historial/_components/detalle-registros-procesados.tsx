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
}

export function DetalleRegistrosProcesados({
  ids,
  firestore,
  sucursalId,
  tipo,
  titulo
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
        const detallesPromises = ids.map(id => {
          if (tipo === 'traslado') {
            const docRef = doc(firestore, 'traslados', id)
            return getDoc(docRef)
          }
          let collectionName = ''
          switch (tipo) {
            case 'movimiento': collectionName = 'cierre_caja'; break
            case 'compra': collectionName = 'compras'; break
            case 'gasto': collectionName = 'gastos'; break
            case 'tragamonedas': collectionName = 'cuadre_tragamonedas'; break
          }
          const docRef = doc(firestore, `sucursales/${sucursalId}/${collectionName}`, id)
          return getDoc(docRef)
        })

        const docsSnapshots = await Promise.all(detallesPromises)
        const fetchedDetalles = docsSnapshots
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))

        setDetalles(fetchedDetalles)
      } catch (err) {
        console.error("Error al cargar registros procesados:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetalles()
  }, [ids, firestore, tipo, sucursalId])

  if (!ids || ids.length === 0) return null

  return (
    <div>
      <h4 className="font-semibold mb-2 text-xs text-slate-300">{titulo} ({ids.length})</h4>
      {isLoading ? (
        <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-sky-400" /></div>
      ) : (
        <div className="space-y-1.5">
          {detalles.map(item => {
            const fechaDoc = item.fecha || item.fechaEnvio
            const fechaStr = fechaDoc?.toDate ? format(fechaDoc.toDate(), "dd/MM/yy hh:mm a", { locale: es }) : 'N/A'
            return (
              <div key={item.id} className="flex justify-between items-center text-xs p-2.5 bg-[#1e1e1e] rounded-lg border border-[#2e2e2e]">
                <div>
                  <p className="font-semibold text-white truncate max-w-44">
                    {tipo === 'movimiento' ? `Cierre Caja #${item.idCuadre}` :
                     tipo === 'tragamonedas' ? `Cierre Tragamonedas #${item.idCuadre}` :
                     tipo === 'traslado' ? `Traslado #TR-${item.idTraslado} a ${item.sucursalDestinoNombre}` :
                     item.descripcion || item.proveedorNombre || `ID: ${item.id}`}
                  </p>
                  <p className="text-slate-400 text-[11px]">{fechaStr}</p>
                </div>
                <p className="font-bold text-white">
                  Q{((item.totalLiquidado ?? item.pagosTarjeta ?? item.monto ?? item.montoTotal ?? item.gananciaATrasladar ?? item.costoTotalTraslado) ?? 0).toFixed(2)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
