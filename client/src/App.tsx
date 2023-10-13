/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import './App.css';
import WebSocket from 'isomorphic-ws';
import Editor from './components/Editor';
import { useSharedData } from './contexts/SharedDocContext';
import * as Y from 'yjs';
import { toUint8Array } from 'js-base64';

/**
 *
 * Implementing webSockets in App
 */
function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { yDoc, getDoc, initDoc } = useSharedData();

  useEffect(() => {
    const initWebsocket = () => {
      if (!yDoc) return;
      const websocket = new WebSocket('ws://localhost:8080');
      websocket.onopen = async () => {
        console.log('Connected');
      };
      websocket.onmessage = (event: any) => {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
          console.log('--- Got new update --- Applying merge');
          Y.applyUpdate(yDoc, toUint8Array(message.update));
        }
      };
      setWs(websocket);
    };

    if (!yDoc) {
      initDoc();
      return;
    }

    if (!ws) {
      // setTimeout(() => {
      initWebsocket();
      // }, 1000);
    }
    return () => {
      if (ws) ws.close();
    };
  }, [ws, initDoc, yDoc, getDoc]);

  return <>{yDoc ? <Editor ws={ws} /> : <h1>Loading . . .</h1>}</>;
}

export default App;
