'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useFirebase, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import type { Tragamonedas, GeneralesTragamonedas, Generales as GeneralesCaja, Cuenta } from "@/lib/tipos"
import { realizarCuadreTragamonedas } from "@/lib/firebase/servicios/cuadre-tragamonedas"
import { useToast } from "@/hooks/use-toast"
import { getFullGenerales } from "@/lib/firebase/servicios"
import { useSucursal } from "@/hooks/use-sucursal"

const CUENTAS_DISPONIBLES: Cuenta[] = [
  { id: 'caja_chica_1', nombre: 'Caja Chica', saldo: 5000, tipo: 'Efectivo', idCuenta: 1 },
]

export function useCuadreTragamonedasCierre() {
  const { firestore } = useFirebase()
  const { toast } = useToast()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [montosManuales, setMontosManuales] = useState<Record<string, number | ''>>({})
  const [existenciaSiguiente, setExistenciaSiguiente] = useState<number | ''>('')
  const [efectivoSiguientePeriodo, setEfectivoSiguientePeriodo] = useState<number | ''>('')
  const [gananciaATrasladar, setGananciaATrasladar] = useState<number | ''>(0)
  const [cuentaDestinoId, setCuentaDestinoId] = useState(CUENTAS_DISPONIBLES[0].id)
  const [observaciones, setObservaciones] = useState('')
  const [alertaAbierta, setAlertaAbierta] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const initializedRef = useRef(false)

  const maquinasQuery = useMemoFirebase(
    () => (firestore && sucursalId)
      ? query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy('idTragamonedas'))
      : null,
    [firestore, sucursalId]
  )
  const { data: maquinas, isLoading: isLoadingMaquinas } = useCollection<Tragamonedas>(maquinasQuery)

  const generalesQuery = useMemoFirebase(
    () => (firestore && sucursalId)
      ? query(collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`))
      : null,
    [firestore, sucursalId]
  )
  const { data: generalesData, isLoading: isLoadingGenerales } = useCollection<GeneralesTragamonedas>(generalesQuery)

  const generalesCajaRef = useMemoFirebase(
    () => (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null,
    [firestore, sucursalId]
  )
  const { data: generalesCajaData, isLoading: isLoadingGeneralesCaja } = useDoc<GeneralesCaja>(generalesCajaRef)

  const configuracionGeneral = useMemo(() => getFullGenerales(generalesCajaData), [generalesCajaData])

  useEffect(() => {
    if (generalesCajaData && !initializedRef.current) {
      initializedRef.current = true
      setExistenciaSiguiente(configuracionGeneral.monedasIniciales || '')
    }
  }, [generalesCajaData, configuracionGeneral.monedasIniciales])

  const maquinasConGenerales = useMemo(() => {
    if (!maquinas || !generalesData) return []
    const generalesMap = new Map(generalesData.map(g => [g.id, g]))
    return maquinas.map(maquina => ({ ...maquina, ...generalesMap.get(maquina.id) }))
  }, [maquinas, generalesData])

  const handleMontoManualChange = useCallback((id: string, valor: string) => {
    setMontosManuales(prev => ({ ...prev, [id]: valor === '' ? '' : Number(valor) }))
  }, [])

  const resumen = useMemo(() => {
    let totalManual = 0, totalBase = 0, totalDeuda = 0, totalExtraccionNeta = 0
    for (const m of maquinasConGenerales) {
      totalManual += Number(montosManuales[m.id] || 0)
      totalBase += m.totalBase || 0
      totalDeuda += m.totalDeuda || 0
      totalExtraccionNeta += m.totalExtraccion || 0
    }
    const totalExtraido = totalManual + totalExtraccionNeta
    return {
      totalManual,
      totalBase,
      totalDeuda,
      totalExtraccionNeta,
      totalExtraido,
      totalNeto: totalExtraido - totalBase,
    }
  }, [maquinasConGenerales, montosManuales])

  const porcentajeGanancia = configuracionGeneral.porcentajetragamonedas || 100
  const gananciaEstimada = resumen.totalNeto * (porcentajeGanancia / 100)

  const handleFinalizarCuadre = useCallback(async () => {
    if (!firestore || !sucursalId) return
    setProcesando(true)
    try {
      await realizarCuadreTragamonedas(firestore, sucursalId, {
        maquinas: maquinasConGenerales.map(m => ({
          id: m.id,
          nombre: m.nombre,
          montoManual: Number(montosManuales[m.id] || 0),
          base: m.totalBase,
          deuda: m.totalDeuda,
          extraccion: m.totalExtraccion,
        })),
        resumen: {
          totalManual: resumen.totalManual,
          totalBase: resumen.totalBase,
          totalDeuda: resumen.totalDeuda,
          totalExtraccionNeta: resumen.totalExtraccionNeta,
        },
        existenciaSiguiente: Number(existenciaSiguiente) || 0,
        efectivoAcumuladoSiguiente: Number(efectivoSiguientePeriodo) || 0,
        gananciaATrasladar: Number(gananciaATrasladar) || 0,
        observaciones,
      })
      toast({ title: "Éxito", description: "El cuadre de tragamonedas se ha realizado correctamente." })
      setMontosManuales({})
      setObservaciones('')
      setGananciaATrasladar(0)
      setExistenciaSiguiente('')
      setEfectivoSiguientePeriodo('')
    } catch (error) {
      console.error("Error realizando cuadre:", error)
      toast({ title: "Error", description: "No se pudo finalizar el cuadre.", variant: "destructive" })
    } finally {
      setProcesando(false)
      setAlertaAbierta(false)
    }
  }, [
    firestore, sucursalId, maquinasConGenerales, montosManuales, resumen,
    existenciaSiguiente, efectivoSiguientePeriodo, gananciaATrasladar, observaciones, toast,
  ])

  return {
    isLoading: isLoadingMaquinas || isLoadingGenerales || isLoadingGeneralesCaja || isLoadingSucursal,
    maquinasConGenerales,
    montosManuales,
    handleMontoManualChange,
    resumen,
    porcentajeGanancia,
    gananciaEstimada,
    existenciaSiguiente,
    setExistenciaSiguiente,
    efectivoSiguientePeriodo,
    setEfectivoSiguientePeriodo,
    gananciaATrasladar,
    setGananciaATrasladar,
    cuentaDestinoId,
    setCuentaDestinoId,
    cuentas: CUENTAS_DISPONIBLES,
    observaciones,
    setObservaciones,
    alertaAbierta,
    setAlertaAbierta,
    procesando,
    handleFinalizarCuadre,
  }
}
