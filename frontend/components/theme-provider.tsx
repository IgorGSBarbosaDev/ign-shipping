'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      storageKey="ign-theme"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { useNextTheme as useTheme }
