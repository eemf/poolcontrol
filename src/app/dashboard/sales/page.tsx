import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

const sales = [
  { id: "VENTA-001", date: "2024-05-20", items: "Mesa 2 (1.5h), 2 Refrescos", amount: 19.00, status: "Pagado" },
  { id: "VENTA-002", date: "2024-05-20", items: "Taco de Billar Pro", amount: 120.00, status: "Pagado" },
  { id: "VENTA-003", date: "2024-05-20", items: "Mesa 5 (2h)", amount: 20.00, status: "Pendiente" },
  { id: "VENTA-004", date: "2024-05-19", items: "4 Cervezas, Papas Fritas", amount: 22.50, status: "Pagado" },
  { id: "VENTA-005", date: "2024-05-19", items: "Mesa 1 (1h)", amount: 10.00, status: "Pagado" },
  { id: "VENTA-006", date: "2024-05-18", items: "Mesa 8 (3h), 1 Pizza", amount: 45.00, status: "Pagado" },
]

export default function SalesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>Un registro de todas las transacciones.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID de Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map(sale => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.id}</TableCell>
                <TableCell>{sale.date}</TableCell>
                <TableCell className="max-w-xs truncate">{sale.items}</TableCell>
                <TableCell>
                  <Badge variant={sale.status === "Pagado" ? "secondary" : "destructive"}>{sale.status}</Badge>
                </TableCell>
                <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
