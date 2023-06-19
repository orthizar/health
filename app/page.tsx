'use client';
import { NextUIProvider } from '@nextui-org/react';
import GCMChart from './components/gcmchart';
import GCMSection from './components/gcmsection';
import Header from './components/header';

export default function Home() {
  return (
    <NextUIProvider>
      <main>
        <Header />
        <GCMSection />
      </main>
    </NextUIProvider>
  );
}
