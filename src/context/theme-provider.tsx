"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

if (typeof window !== "undefined") {
  const shouldSuppress = (args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : ""
    return (
      first.includes("[Fast Refresh]") ||
      first.includes("Download the React DevTools") ||
      first.includes("Missing `Description`")
    )
  }

  const origLog = console.log.bind(console)
  const origInfo = console.info.bind(console)
  const origWarn = console.warn.bind(console)

  console.log = (...args: unknown[]) => {
    if (shouldSuppress(args)) return
    origLog(...args)
  }
  console.info = (...args: unknown[]) => {
    if (shouldSuppress(args)) return
    origInfo(...args)
  }
  console.warn = (...args: unknown[]) => {
    if (shouldSuppress(args)) return
    origWarn(...args)
  }

  // Desactivar descripciones nativas (atributo title) en toda la aplicación
  window.addEventListener(
    "mouseover",
    (e) => {
      let el = e.target as HTMLElement | null
      while (el && el !== document.body) {
        if (el.hasAttribute && el.hasAttribute("title")) {
          el.removeAttribute("title")
        }
        el = el.parentElement
      }
    },
    { capture: true, passive: true }
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
