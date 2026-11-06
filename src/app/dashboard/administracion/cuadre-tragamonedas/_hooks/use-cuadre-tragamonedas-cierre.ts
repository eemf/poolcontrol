'use client'

import { useState, useMemo, useEffect } from "react"
import { useFirebase, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import type { Tragamonedas, GeneralesTragamonedas, Generales as GeneralesCaja, Cuenta } from "@/lib/tipos"
import { realizarCuadreTragamonedas } from "@/lib/firebase/servicios/cuadre-tragamonedas"
import { useToast } from "@/hooks/use-toast"
import { getFullGenerales } from "@/lib/firebase/servicios"
import { useSucursal } from "@/hooks/use-sucursal"

export function useCuadreTragamonedasCierre() {
  const { firestore } = useFirebase()
  const { toast } = useToast()
  const { sucursalId, isLoading: isLoadingSucursal } = useSucursal()

  const [montosManuales, setMontosManuales] = useState<{ [key: string]: number | '' }>({})
  const [existenciaSiguiente, setExistenciaSiguiente] = useState<number | ''>('')
  const [efectivoSiguientePeriodo, setEfectivoSiguientePeriodo] = useState<number | ''>('')
  const [gananciaATrasladar, setGananciaATrasladar] = useState<number | ''>(0)
  const [cuentaDestinoId, setCuentaDestinoId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [alertaAbierta, setAlertaAbierta] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])

  const maquinasQuery = useMemoFirebase(() =>
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/tragamonedas`), orderBy('idTragamonedas')) : null,
  [firestore, sucursalId])
  const { data: maquinas, isLoading: isLoadingMaquinas } = useCollection<Tragamonedas>(maquinasQuery)

  const generalesQuery = useMemoFirebase(() =>
    (firestore && sucursalId) ? query(collection(firestore, `sucursales/${sucursalId}/generales_tragamonedas`)) : null,
  [firestore, sucursalId])
  const { data: generalesData, isLoading: isLoadingGenerales } = useCollection<GeneralesTragamonedas>(generalesQuery)

  const generalesCajaRef = useMemoFirebase(() =>
    (firestore && sucursalId) ? doc(firestore, `sucursales/${sucursalId}/generales/actual`) : null,
  [firestore, sucursalId])
  const { data: generalesCajaData, isLoading: isLoadingGeneralesCaja } = useDoc<GeneralesCaja>(generalesCajaRef)

  const configuracionGeneral = useMemo(() => getFullGenerales(generalesCajaData), [generalesCajaData])

  useEffect(() => {
    if (generalesCajaData) {
      setExistenciaSiguiente(configuracionGeneral.monedasIniciales || '')
    }
    const cuentasDeEjemplo: Cuenta[] = [{ id: 'caja_chica_1', nombre: 'Caja Chica', saldo: 5000, tipo: 'Efectivo', idCuenta: 1 }]
    setCuentas(cuentasDeEjemplo)
    if (cuentasDeEjemplo.length > 0) setCuentaDestinoId(cuentasDeEjemplo[0].id)
  }, [generalesCajaData, configuracionGeneral])

  const maquinasConGenerales = useMemo(() => {
    if (!maquinas || !generalesData) return []
    return maquinas.map(maquina => {
      const generales = generalesData.find(g => g.id === maquina.id)
      return {
        ...maquina,
        ...generales,
      }
    })
  }, [maquinas, generalesData])

  const handleMontoManualChange = (id: string, valor: string) => {
    setMontosManuales(prev => ({ ...prev, [id]: valor === '' ? '' : Number(valor) }))
  }

  const resumen = useMemo(() => {
    let totalManual = 0, totalBase = 0, totalDeuda = 0, totalExtraccionNeta = 0

    maquinasConGenerales.forEach(m => {
      totalManual += Number(montosManuales[m.id] || 0)
      totalBase += m.totalBase || 0
      totalDeuda += m.totalDeuda || 0
      totalExtraccionNeta += m.totalExtraccion || 0
    })

    const totalExtraido = totalManual + totalExtraccionNeta
    const totalNeto = totalExtraido - totalBase

    return { totalManual, totalBase, totalDeuda, totalExtraccionNeta, totalExtraido, totalNeto }
  }, [maquinasConGenerales, montosManuales])

  const porcentajeGanancia = configuracionGeneral.porcentajetragamonedas || 100
  const gananciaEstimada = resumen.totalNeto * (porcentajeGanancia / 100)

  const handleFinalizarCuadre = async () => {
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
          extraccion: m.totalExtraccion
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
  }

  const isLoading = isLoadingMaquinas || isLoadingGenerales || isLoadingGeneralesCaja || isLoadingSucursal

  return {
    isLoading,
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
    cuentas,
    observaciones,
    setObservaciones,
    alertaAbierta,
    setAlertaAbierta,
    procesando,
    handleFinalizarCuadre,
  }
}
