"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

// El tema vive en localStorage (o en la preferencia del sistema si no hay uno guardado).
const listeners = new Set<() => void>()

function leerTema(): Theme {
  try {
    const guardado = localStorage.getItem('theme')
    if (guardado === 'light' || guardado === 'dark') return guardado
  } catch {
    // localStorage no disponible: se usa la preferencia del sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function suscribir(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSyncExternalStore<Theme>(suscribir, leerTema, () => 'light')

  // Solo se aplica al DOM. No se guarda aquí: durante la hidratación `theme` vale 'light'
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('theme', theme)
  }, [theme])

  const toggle = () => {
    const siguiente: Theme = theme === 'light' ? 'dark' : 'light'
    try {
      localStorage.setItem('theme', siguiente)
    } catch {
    }
    listeners.forEach((listener) => listener())
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }

  return context
}