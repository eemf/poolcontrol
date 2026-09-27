'use client'

import { useState, useEffect } from "react"
import { getAuth, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Moon, Sun, Monitor } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/firebase"
import { useTheme } from "next-themes"

export function UserNav() {
  const { user, isUserLoading, profile } = useUser()
  const router = useRouter()
  const auth = getAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!isMounted || isUserLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  if (!user) {
    return null;
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
          return nameParts[0][0] + nameParts[1][0];
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  const displayName = profile?.nombre || user.displayName || user.email;
  const displayEmail = profile?.email || user.email;

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/5 transition-colors shrink-0">
                <Avatar className="h-9 w-9 border border-primary/20 shadow-sm mx-auto">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">
                    {getInitials(displayName, displayEmail)}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2 font-body" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-foreground">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                {displayEmail}
                </p>
                {profile?.rol && (
                  <p className="text-[9px] leading-none text-primary mt-2 uppercase tracking-widest font-black opacity-80 bg-primary/5 w-fit px-2 py-1 rounded-full">
                    {profile.rol}
                  </p>
                )}
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
             <DropdownMenuGroup>
                <p className="px-3 py-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Apariencia</p>
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" /> <span className="text-xs font-medium">Modo Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" /> <span className="text-xs font-medium">Modo Oscuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" /> <span className="text-xs font-medium">Sistema</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Cerrar Sesión</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
