'use client';
import { Loading, NextUIProvider } from '@nextui-org/react';
import GCMSection from './components/gcmsection';
import Header from './components/header';
import { useState, useEffect } from 'react';
import { Flex } from './components/styles/flex';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);
  return (
      isLoading ? (
        <main />
      ) : (
        <NextUIProvider>
          <main>
            <Header />
            <GCMSection />
          </main>
        </NextUIProvider>
      )
  );
}
