'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { 
  Boxes, Dices, LayoutGrid, ShoppingCart, Home, Settings, ChevronDown, 
  Palette, Contact, UserCheck, ShieldCheck, Package, DollarSign, 
  TableProperties,
  Truck, Scale, History, HandCoins, Landmark, BookUser, CalendarDays, 
  Calendar, FlaskConical, PiggyBank, FileClock, MonitorCheck, Ghost, Layers, Moon, Wrench, Bell, Eraser, Layout, ChevronUp, Building2, Info
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useUser, useDoc, useMemoFirebase, useFirebase, useCollection } from "@/firebase"
import { useSucursal } from "@/hooks/use-sucursal"
import { usePermissions } from "@/hooks/use-permissions"
import { doc, collection, query, orderBy } from "firebase/firestore"
import type { Sucursal } from "@/lib/tipos"
import { appVersion } from '@/lib/version';
import { ScrollArea } from "@/components/ui/scroll-area"

type NavItemType = {
  href?: string;
  label: string;
  icon: React.ElementType;
  items?: NavItemType[];
  permission?: string;
  anyPermission?: string[];
  feature?: string;
};

export const navItems: NavItemType[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, permission: 'dashboard.ver' },
  { href: '/dashboard/mesas', label: 'Sala de Juegos', icon: LayoutGrid, permission: 'mesas.ver', feature: 'mesas' },
  { href: '/dashboard/ventas', label: 'Punto de Venta', icon: ShoppingCart, permission: 'ventas.pos', feature: 'ventas' },
  { href: '/dashboard/gestion-tragamonedas', label: 'Tragamonedas', icon: Dices, permission: 'tragamonedas.ver', feature: 'tragamonedas' },
  { href: '/dashboard/cierre-caja', label: 'Cierre de Caja', icon: Scale, permission: 'caja.cerrar', feature: 'cierreCaja' },
  { href: '/dashboard/administracion/inventario', label: 'Inventario', icon: Boxes, permission: 'inventario.ver', feature: 'adminInventario' },
  {
    label: 'Administración',
    icon: Landmark,
    anyPermission: ['admin.monitoreo', 'admin.movimientos', 'compras.gestionar', 'gastos.gestionar', 'tragamonedas.cuadre', 'cuadre.semanal', 'cuadre.mensual', 'ventas.eliminar_rango'],
    items: [
        { href: '/dashboard/administracion/monitoreo-integral', label: 'Monitoreo Integral', icon: MonitorCheck, permission: 'admin.monitoreo' },
        { href: '/dashboard/administracion/monitoreo-periodo', label: 'Monitoreo Período', icon: MonitorCheck, permission: 'admin.monitoreo', feature: 'adminMonitoreo' },
        { href: '/dashboard/administracion/movimiento-productos', label: 'Movimiento de Productos', icon: History, permission: 'admin.movimientos', feature: 'adminMovimientos' },
        { href: '/dashboard/compras', label: 'Compras', icon: Truck, permission: 'compras.gestionar', feature: 'compras' },
        { href: '/dashboard/gastos', label: 'Gastos', icon: DollarSign, permission: 'gastos.gestionar', feature: 'adminGastos' },
        { href: '/dashboard/administracion/cuadre-tragamonedas', label: 'Cuadre Tragamonedas', icon: PiggyBank, permission: 'tragamonedas.cuadre', feature: 'adminCuadreTraga' },
        { href: '/dashboard/administracion/cuadre-semanal', label: 'Cuadre Semanal', icon: CalendarDays, permission: 'cuadre.semanal', feature: 'adminCuadreSemanal' },
        { href: '/dashboard/administracion/cuadre-mensual', label: 'Cuadre Mensual', icon: Calendar, permission: 'cuadre.mensual', feature: 'adminCuadreMensual' },
        { href: '/dashboard/administracion/eliminacion-ventas', label: 'Eliminar por Rango', icon: Eraser, permission: 'ventas.eliminar_rango' },
    ]
  },
  {
    label: 'Mantenimiento',
    icon: Wrench,
    anyPermission: ['mant.clientes', 'config.productos', 'mant.productos_virt', 'mant.roles', 'mant.pagos', 'mant.cuentas', 'admin.monitoreo'],
    items: [
        { href: '/dashboard/mantenimiento/monitoreo-integral', label: 'Monitoreo Integral (Pruebas)', icon: MonitorCheck, permission: 'admin.monitoreo' },
        { href: '/dashboard/mantenimiento/clientes', label: 'Clientes', icon: Contact, permission: 'mant.clientes', feature: 'mantClientes' },
        { href: '/dashboard/mantenimiento/productos', label: 'Productos', icon: Package, permission: 'config.productos', feature: 'mantProductos' },
        { href: '/dashboard/mantenimiento/productos-virtuales', label: 'Prod. Virtuales', icon: Ghost, permission: 'mant.productos_virt', feature: 'mantProductosVirt' },
        { href: '/dashboard/mantenimiento/roles', label: 'Roles', icon: ShieldCheck, permission: 'mant.roles', feature: 'mantRoles' },
        { href: '/dashboard/mantenimiento/gestion-pagos', label: 'Pagos', icon: HandCoins, permission: 'mant.pagos', feature: 'mantPagos' },
        { href: '/dashboard/mantenimiento/cuentas', label: 'Cuentas', icon: BookUser, permission: 'mant.cuentas', feature: 'adminCuentas' },
    ]
  },
  {
    label: 'Configuraciones',
    icon: Settings,
    anyPermission: ['config.usuarios', 'config.permisos', 'config.mesas', 'config.tragamonedas', 'dashboard.ver'],
    items: [
      { href: '/dashboard/configuraciones/usuarios', label: 'Usuarios', icon: UserCheck, permission: 'config.usuarios' },
      { href: '/dashboard/configuraciones/permisos', label: 'Permisos', icon: ShieldCheck, permission: 'config.permisos' },
      { href: '/dashboard/configuraciones/mesas', label: 'Mesas', icon: LayoutGrid, permission: 'config.mesas', feature: 'configMesas' },
      { href: '/dashboard/configuraciones/tragamonedas', label: 'Tragamonedas', icon: Dices, permission: 'config.tragamonedas', feature: 'configTragamonedas' },
      { href: '/dashboard/configuraciones/acerca-de', label: 'Acerca del Sistema', icon: Info, permission: 'dashboard.ver' },
    ]
  },
  {
    label: 'Pruebas',
    icon: FlaskConical,
    permission: 'pruebas.ver',
    items: [
      { href: '/dashboard/pruebas/monitoreo-integral', label: 'Monitoreo Integral', icon: MonitorCheck },
      { href: '/dashboard/pruebas/solucion-pago-unificado', label: 'Pago Unificado', icon: TableProperties },
      { href: '/dashboard/pruebas/diseno-botones', label: 'Diseño Botones', icon: Palette },
      { href: '/dashboard/pruebas/modelo-de-modal', label: 'Modelo Modal', icon: Layers },
      { href: '/dashboard/pruebas/modelos-dialogo-pos', label: 'Modelos Diálogo POS', icon: Layout },
      { href: '/dashboard/pruebas/modelo-historial-ventas', label: 'Modelo Historial', icon: FileClock },
      { href: '/dashboard/pruebas/modelos-mesas', label: 'Modelos Mesas', icon: LayoutGrid },
      { href: '/dashboard/pruebas/modo-oscuro', label: 'Modo Oscuro', icon: Moon },
      { href: '/dashboard/pruebas/notificaciones', label: 'Notificaciones', icon: Bell },
    ]
  },
];

const NavItem = ({ 
    item, 
    pathname, 
    isCollapsed, 
    onNavigate, 
    hasPermission, 
    hasAnyPermission,
    branchFeatures,
    isSubItem = false,
}: { 
    item: NavItemType, 
    pathname: string, 
    isCollapsed: boolean, 
    onNavigate?: () => void, 
    hasPermission: (k: string) => boolean, 
    hasAnyPermission: (k: string[]) => boolean,
    branchFeatures: { [key: string]: boolean },
    isSubItem?: boolean,
}) => {
  if (item.feature && branchFeatures[item.feature] === false) return null;

  const canSeeParent = item.permission ? hasPermission(item.permission) : (item.anyPermission ? hasAnyPermission(item.anyPermission) : true);
  if (!canSeeParent) return null;

  const hasSubItems = Array.isArray(item.items) && item.items.length > 0;
  const visibleSubItems = item.items?.filter(sub => {
    if (sub.feature && branchFeatures[sub.feature] === false) return false;
    if (sub.permission) return hasPermission(sub.permission);
    if (sub.anyPermission) return hasAnyPermission(sub.anyPermission);
    return true;
  }) || [];

  if (hasSubItems && visibleSubItems.length === 0) return null;

  const isDashboard = item.href === '/dashboard';
  const isActive = item.href ? (isDashboard ? pathname === item.href : pathname.startsWith(item.href)) : false;

  const isParentActive = hasSubItems ? visibleSubItems.some(subItem => {
    if (subItem.href && pathname.startsWith(subItem.href)) return true;
    if (subItem.items) {
        return subItem.items.some(child => child.href && pathname.startsWith(child.href));
    }
    return false;
  }) : false;

  const [isOpen, setIsOpen] = React.useState(isParentActive);
  
  if (!hasSubItems && item.href) {
    const buttonContent = (
      <Button
        asChild
        variant={isActive ? "default" : "ghost"}
        title={item.label}
        className={cn(
          "w-full rounded-full transition-all duration-300",
          isSubItem ? "h-9" : "h-10",
          isCollapsed 
            ? "justify-center px-0 gap-0" 
            : isSubItem 
              ? "justify-start px-2.5 gap-2" 
              : "justify-start px-3 gap-3",
          !isActive && "hover:bg-primary/10 hover:text-primary"
        )}
      >
        <Link 
          href={item.href} 
          onClick={onNavigate} 
          className={cn(
            "flex items-center min-w-0 w-full",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <item.icon className={cn(isSubItem ? "h-4 w-4" : "h-5 w-5", "shrink-0")} />
          {!isCollapsed && (
            <span className={cn(
              "transition-all duration-300 ease-in-out truncate min-w-0 flex-1 text-left",
              isSubItem ? "ml-2 text-xs" : "ml-3 text-sm"
            )}>
              {item.label}
            </span>
          )}
        </Link>
      </Button>
    );

    return isCollapsed ? (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      buttonContent
    );
  }

  if (hasSubItems && !isCollapsed) {
    const isTriggerActive = isParentActive && !isOpen;
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={isTriggerActive ? "default" : "ghost"}
            title={item.label}
            className={cn(
              "w-full justify-start rounded-full px-3 h-10 transition-all duration-300 gap-3",
              !isTriggerActive && "hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className={cn(
              "ml-0 truncate min-w-0 flex-1 text-left transition-all duration-300 text-sm"
            )}>
              {item.label}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2 py-1 space-y-1 border-l-2 border-muted/50 ml-4">
            {visibleSubItems.map(subItem => (
              <NavItem 
                key={subItem.label} 
                item={subItem} 
                pathname={pathname} 
                isCollapsed={isCollapsed} 
                onNavigate={onNavigate} 
                hasPermission={hasPermission} 
                hasAnyPermission={hasAnyPermission} 
                branchFeatures={branchFeatures}
                isSubItem={true}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (hasSubItems && isCollapsed) {
    return (
      <DropdownMenu modal={false}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isParentActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-center rounded-full px-0 h-10 transition-all duration-300 gap-0",
                    !isParentActive && "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side="right" align="start" className="w-48 p-1 font-body">
          <div className="space-y-1">
            {visibleSubItems.map(subItem => {
              if (!subItem.feature || branchFeatures[subItem.feature] !== false) {
                if (!subItem.href) {
                  return <div key={subItem.label} className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{subItem.label}</div>
                }
                const isSubActive = pathname.startsWith(subItem.href);
                return (
                  <Button key={subItem.label} asChild variant={isSubActive ? "default" : "ghost"} size="sm" className={cn("w-full justify-start rounded-full", !isSubActive && "hover:bg-primary/10 hover:text-primary")}>
                    <Link href={subItem.href} onClick={onNavigate}>
                      <subItem.icon className="mr-2 h-4 w-4" />
                      <span className="text-xs">{subItem.label}</span>
                    </Link>
                  </Button>
                )
              }
              return null;
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null;
}

export default function ClientDashboardNav({ pathname }: { pathname: string }) {
  const { firestore } = useFirebase();
  const { isMobile, setOpenMobile, state: sidebarState, setIsLocked, setOpen } = useSidebar();
  const isCollapsed = !isMobile && sidebarState === 'collapsed';
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = React.useState(false);
  const [isMobileBranchOpen, setIsMobileBranchOpen] = React.useState(false);
  const { isAdmin: isSuperAdmin, profile } = useUser();
  const { sucursalId } = useSucursal();
  const { hasPermission, hasAnyPermission, isLoading: isLoadingPerms } = usePermissions();

  const sucursalRef = useMemoFirebase(() =>
    (firestore && sucursalId) ? doc(firestore, 'sucursales', sucursalId) : null,
    [firestore, sucursalId]
  );
  const { data: sucursalData, isLoading: isLoadingSucursalData } = useDoc<Sucursal>(sucursalRef);

  // Consulta de todas las sucursales para el Super Admin o usuarios con Acceso Global
  const puedeSaltar = isSuperAdmin || profile?.accesoGlobal === true;
  
  const sucursalesQuery = useMemoFirebase(() => 
    (firestore && puedeSaltar) ? query(collection(firestore, 'sucursales'), orderBy('idSucursal')) : null
  , [firestore, puedeSaltar]);
  const { data: todasLasSucursales } = useCollection<Sucursal>(sucursalesQuery);

  const branchFeatures = React.useMemo(() => sucursalData?.features || {}, [sucursalData]);

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSwitchBranch = (newId: string) => {
    if (newId === sucursalId) return;
    localStorage.setItem('selectedSucursalId', newId);
    window.location.reload();
  };

  const isLoading = isLoadingPerms || isLoadingSucursalData;

  if (isLoading) return null;

  const branchDisplay = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 min-h-[48px]",
      isCollapsed ? "justify-center px-0" : "bg-primary/5 group-hover:bg-primary/10"
    )}>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
        <Dices className="h-4 w-4" />
      </div>
      {!isCollapsed && (
        <div className="min-w-0 flex-1 overflow-hidden flex items-center justify-between">
          <p className="text-sm font-bold truncate text-foreground pr-2">{sucursalData?.nombre || "Sin sucursal"}</p>
          {puedeSaltar && (
            <ChevronUp
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
                isBranchDropdownOpen && "rotate-180"
              )}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="p-4 border-b flex items-center gap-3 md:hidden">
            <Dices className="h-6 w-6 text-primary shrink-0" />
            <div>
                <h2 className="text-base font-headline font-semibold leading-tight text-foreground">Pool Control</h2>
                <Link href="/dashboard/configuraciones/acerca-de">
                  <p className="text-[9px] text-muted-foreground font-medium hover:text-primary hover:underline transition-colors">v{appVersion.version} (b{appVersion.build})</p>
                </Link>
            </div>
        </div>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <NavItem
                item={item as NavItemType}
                pathname={pathname}
                isCollapsed={isCollapsed}
                onNavigate={handleNavigate}
                hasPermission={hasPermission}
                hasAnyPermission={hasAnyPermission}
                branchFeatures={branchFeatures}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className={cn("mt-auto p-2 flex flex-col gap-2 border-t border-sidebar-border/50")}>
        
        {puedeSaltar ? (
          isMobile ? (
            <Collapsible
              open={isMobileBranchOpen}
              onOpenChange={setIsMobileBranchOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full text-left group cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 min-h-[48px] bg-primary/5 hover:bg-primary/10">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                      <Dices className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden flex items-center justify-between">
                      <p className="text-sm font-bold truncate text-foreground pr-2">
                        {sucursalData?.nombre || "Sin sucursal"}
                      </p>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                          isMobileBranchOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/60 p-1.5 space-y-1 max-h-56 overflow-y-auto">
                  <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 tracking-wider">
                    Cambiar de sucursal
                  </p>
                  {(todasLasSucursales || []).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={cn(
                        "w-full px-2.5 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-3 transition-colors text-left",
                        s.id === sucursalId
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-muted/70 text-foreground"
                      )}
                      onClick={() => {
                        setIsMobileBranchOpen(false);
                        handleSwitchBranch(s.id);
                        setOpenMobile(false);
                      }}
                    >
                      <Building2 className="h-4 w-4 shrink-0 opacity-70" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{s.nombre}</p>
                        <p className="text-[9px] opacity-60 font-medium">ID #{s.idSucursal}</p>
                      </div>
                      {s.id === sucursalId && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                          Activa
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <DropdownMenu
              modal={false}
              open={isBranchDropdownOpen}
              onOpenChange={(open) => {
                setIsBranchDropdownOpen(open);
                setIsLocked(open);
                if (open) setOpen(true);
              }}
            >
              <DropdownMenuTrigger asChild>
                <div className="group cursor-pointer">
                  {isCollapsed ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>{branchDisplay}</TooltipTrigger>
                        <TooltipContent side="right"><p>Cambiar Sucursal</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : branchDisplay}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isCollapsed ? "right" : "top"} align={isCollapsed ? "start" : "center"} className="w-64 font-body rounded-2xl shadow-2xl border-none">
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground tracking-wider px-3 py-2">
                  Cambiar de Sucursal
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {(todasLasSucursales || []).map(s => (
                    <DropdownMenuItem 
                      key={s.id} 
                      className={cn(
                        "px-3 py-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-3",
                        s.id === sucursalId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        setIsBranchDropdownOpen(false);
                        setIsLocked(false);
                        handleSwitchBranch(s.id);
                      }}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{s.nombre}</p>
                        <p className="text-[9px] opacity-60 font-medium">ID #{s.idSucursal}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : (
          sucursalData && (
            <div className="cursor-default">
               {isCollapsed ? (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>{branchDisplay}</TooltipTrigger>
                      <TooltipContent side="right"><p>{sucursalData.nombre}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : branchDisplay}
            </div>
          )
        )}

        {(isSuperAdmin || puedeSaltar) && sucursalId && (
          <div className="w-full">
              <div className={cn(
                  "text-center text-[10px] font-bold tracking-wider text-destructive-foreground bg-destructive rounded-lg transition-all duration-300 overflow-hidden",
                  isCollapsed ? "p-2 opacity-50" : "p-1.5 opacity-100"
              )}>
                  {isCollapsed ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <ShieldCheck className="h-4 w-4 mx-auto"/>
                              </TooltipTrigger>
                              <TooltipContent side="right"><p>{isSuperAdmin ? 'Super Admin' : 'Acceso Global'}: Sucursal #{sucursalId}</p></TooltipContent>
                              </Tooltip>
                      </TooltipProvider>
                  ) : (
                      isSuperAdmin ? `Super Admin: Suc #${sucursalId}` : `Acceso Global: Suc #${sucursalId}`
                  )}
              </div>
          </div>
        )}
       </div>
    </>
  )
}
