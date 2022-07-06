import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app';

const container = document.getElementById('root');

declare global {
  interface Window {
    ssrData?: {count: number};
  }
  const SITE: 'server' | 'client';
}

if (container?.hasChildNodes()) {
  const { count } = window.ssrData ?? {};
  hydrateRoot(container!, <App countFromServer={count}/>);
} else {
  createRoot(container!).render(<App />);
}

