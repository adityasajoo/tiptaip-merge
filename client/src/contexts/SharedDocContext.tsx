import { FC, createContext, useContext, useState } from 'react';
import * as Y from 'yjs';

/**
 * This context is used in main.tsx
 */
interface Props {
  children?: React.ReactNode;
}

interface ContextI {
  yDoc: Y.Doc | null;
  initDoc: () => void;
  getDoc: () => Y.Doc | null;
  deleteDoc: () => void;
}

const SharedDocContext = createContext<ContextI>({
  yDoc: null,
  initDoc: () => {},
  getDoc: () => null,
  deleteDoc: () => {},
});

export const SharedDocContextProvider: FC<Props> = ({ children }) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const initDoc = () => {
    const yDoc = new Y.Doc();
    setDoc(yDoc);
    console.log('--- New Y Doc set');
  };

  const getDoc = () => doc;

  const deleteDoc = () => {
    if (doc) doc.destroy();
    setDoc(null);
    console.log('--- YDoc Destroyed');
  };

  return (
    <SharedDocContext.Provider
      value={{ yDoc: doc, initDoc, getDoc, deleteDoc }}>
      {children}
    </SharedDocContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSharedData = () => useContext(SharedDocContext);

export default SharedDocContext;
