
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dices, Play, Square } from "lucide-react"
import { cn } from "@/lib/utils"

const RATE_PER_HOUR = 10 // $10 per hour

type TableStatus = "Libre" | "Ocupado"

interface Table {
  id: number
  name: string
  status: TableStatus
  startTime: number | null
  elapsedTime: number // in seconds
  cost: number
}

const initialTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Mesa ${i + 1}`,
  status: "Libre",
  startTime: null,
  elapsedTime: 0,
  cost: 0,
}))

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables)

  useEffect(() => {
    const timer = setInterval(() => {
      setTables(prevTables =>
        prevTables.map(table => {
          if (table.status === "Ocupado" && table.startTime) {
            const elapsedTime = Math.floor((Date.now() - table.startTime) / 1000)
            const cost = (elapsedTime / 3600) * RATE_PER_HOUR
            return { ...table, elapsedTime, cost }
          }
          return table
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleToggleTimer = (tableId: number) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          if (table.status === "Libre") {
            return { ...table, status: "Ocupado", startTime: Date.now() }
          } else {
            // Here you would typically save the final cost to your database
            return { ...table, status: "Libre", startTime: null, elapsedTime: 0, cost: 0 }
          }
        }
        return table
      })
    )
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {tables.map(table => (
        <Card key={table.id} className={cn("flex flex-col transition-all", table.status === "Ocupado" && "border-primary shadow-lg shadow-primary/10")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
            <Badge variant={table.status === "Ocupado" ? "default" : "secondary"}>{table.status}</Badge>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-body">Tiempo de Juego</p>
              <p className="text-4xl font-bold font-headline tabular-nums">
                {formatTime(table.elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-body">Costo</p>
              <p className="text-2xl font-bold text-primary font-body">${table.cost.toFixed(2)}</p>
            </div>
            <Button onClick={() => handleToggleTimer(table.id)} variant={table.status === "Ocupado" ? "destructive" : "default"} className="rounded-full font-bold">
              {table.status === "Ocupado" ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {table.status === "Ocupado" ? "Finalizar y Cobrar" : "Iniciar Tiempo"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
