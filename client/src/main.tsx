import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SharedDocContextProvider } from './contexts/SharedDocContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SharedDocContextProvider>
    <App />
  </SharedDocContextProvider>
);
