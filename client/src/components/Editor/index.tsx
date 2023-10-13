import { useEditor, EditorContent, Editor as EditorI } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import './style.css';
import { useSharedData } from '../../contexts/SharedDocContext';
import axios from 'axios';
import WebSocket from 'isomorphic-ws';
import * as Y from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { useEffect, useRef, useState } from 'react';
// define your extension array
const extensions = [StarterKit];

const Editor = ({ ws }: { ws: WebSocket | null }) => {
  const { yDoc } = useSharedData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timer = useRef<any>(null);
  const firstLoad = useRef(true);
  const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     setTimeout(loadData, 2000);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  const loadData = async (editor: EditorI) => {
    setLoading(true);

    /**
     * returns {
     * noteId : string
     * content : JSON/base64
     * type: 'base64'/'json'
     * }
     */
    const { data } = await axios.get('http://localhost:8080/1');
    /**
     * Set editor content
     */
    if (!editor) return console.log('No Editor --- in loadData');
    if (!yDoc) return console.log('No yDoc --- in loadData');

    if (data.type === 'json') editor?.commands.setContent(data.content, true);
    else {
      Y.applyUpdate(yDoc, toUint8Array(data.content));
    }
    setLoading(false);
  };

  const saveData = () => {
    if (!ws) return console.log('No websocket --- in saveData');
    if (!yDoc) return console.log('No yDoc --- in saveData');

    const update = Y.encodeStateAsUpdate(yDoc);
    ws.send(
      JSON.stringify({
        type: 'update',
        update: fromUint8Array(update),
        jsonContent: editor?.getJSON(),
        noteId: 1,
      })
    );
  };

  const delaySave = () => {
    if (timer.current) clearTimeout(timer.current);
    /**
     * Disabling Delay save - timer 0
     * Update triggering unnecessary socket message - To be fixed
     */
    timer.current = setTimeout(saveData, 1000);
  };

  const editor = useEditor({
    extensions: [
      ...extensions,
      Collaboration.configure({
        document: yDoc,
      }),
    ],
    onCreate({ editor }) {
      loadData(editor as EditorI);
    },
    onUpdate() {
      //   if (firstLoad.current) {
      //     firstLoad.current = false;
      //     return;
      //   }
      delaySave();
    },
  });

  if (loading) {
    return <h1>We are setting up the Editor!</h1>;
  }

  return (
    <>
      <EditorContent editor={editor} />
      {/* <button onClick={saveData}>Save Data</button>
      <button onClick={loadData}>Load Data</button> */}
    </>
  );
};

export default Editor;
