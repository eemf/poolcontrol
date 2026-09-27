'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { LayoutGrid, Building, Users, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SidebarContent, SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export const adminNavItems = [
  { href: '/admin-success', label: 'Dashboard', icon: LayoutGrid  },
  { href: '/admin-success/sucursales', label: 'Sucursales', icon: Building },
  { href: '/admin-success/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin-success/suscripciones', label: 'Suscripciones', icon: CalendarClock },
];

export default function AdminDashboardNav() {
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = !isMobile && sidebarState === 'collapsed';

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarContent>
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full rounded-full transition-all duration-300 h-10",
                        isCollapsed ? "justify-center px-0 gap-0" : "justify-start px-3 gap-3"
                      )}
                    >
                      <Link href={item.href} onClick={handleNavigate}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className={cn(
                          "whitespace-nowrap transition-all duration-300 ease-in-out",
                          isCollapsed ? "opacity-0 w-0 ml-0 overflow-hidden" : "opacity-100 ml-3 w-auto"
                        )}>
                          {item.label}
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right"><p>{item.label}</p></TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
