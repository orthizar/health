'use client';
import { NextUIProvider, createTheme } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import GCMSection from './components/gcmsection';
import Header from './components/header';
import { useState, useEffect } from 'react';

const theme = {
  colors: {
    primary: '#E94560',
    secondary: '#E94560',
    accent: '#E94560',
    foreground: '#FFFFFF',
    selection: '#E94560',
    higlight: '#E94560',
    primarySolidHover: '#E94560',
  },
};

const lightTheme = createTheme({
  type: 'light',
  theme: theme,
})

const darkTheme = createTheme({
  type: 'dark',
  theme: theme,
})


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);
  return (
    isLoading ? (
      <main />
    ) : (
      <NextThemesProvider
        defaultTheme="system"
        attribute="class"
        value={{
          light: lightTheme.className,
          dark: darkTheme.className
        }}
      >
        <NextUIProvider>
          <main>
            <Header />
            <GCMSection />
          </main>
        </NextUIProvider>
      </NextThemesProvider>
    )
  );
}
