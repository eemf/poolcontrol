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

const inventory = [
  { id: 1, name: "Cerveza Nacional", category: "Bebidas", stock: 48, status: "En Stock" },
  { id: 2, name: "Cerveza Importada", category: "Bebidas", stock: 22, status: "En Stock" },
  { id: 3, name: "Refresco de Cola", category: "Bebidas", stock: 8, status: "Bajo Stock" },
  { id: 4, name: "Agua Embotellada", category: "Bebidas", stock: 30, status: "En Stock" },
  { id: 5, name: "Papas Fritas", category: "Snacks", stock: 15, status: "En Stock" },
  { id: 6, name: "Pizza Congelada", category: "Comida", stock: 5, status: "Bajo Stock" },
  { id: 7, name: "Tiza para Tacos", category: "Accesorios", stock: 50, status: "En Stock" },
  { id: 8, name: "Guantes de Billar", category: "Accesorios", stock: 3, status: "Bajo Stock" },
  { id: 9, name: "Taco de Billar Estándar", category: "Accesorios", stock: 12, status: "En Stock" },
]

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Inventario</CardTitle>
            <CardDescription>Administra los productos y accesorios de tu local.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>En Stock</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "En Stock" ? "secondary" : "destructive"}>{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
