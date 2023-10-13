const express = require('express');
const app = express();
const WebSocket = require('ws');
var cors = require('cors');
const mock_editor = require('./database/mock_editor');
let server = require('http').createServer();
const PORT = 8080;
const fs = require('fs');
const {
  getNotes,
  getOpenNotes,
  saveOpenNote,
  saveNote,
} = require('./database/utils');

/**
 * Express middlewares
 */
app.use(cors());

/**
 * REST API
 */

/**
 * GET - All notes
 */
app.get('/', (req, res) => {
  res.json({ message: 'Hello world' });
});

/**
 * GET - Single note
 */
app.get('/:id', (req, res) => {
  const data = getOpenNotes();
  /**
   * If data present in Open notes DB, send that data
   */
  if (Object.hasOwn(data, req.params.id))
    res.json({
      noteId: req.params.id,
      content: data[req.params.id].content,
      type: 'base64',
    });
  /**
   * Else send JSON content from main DB
   * Whenever a note (in the FE) receives a JSON content, it will trigger an auto save
   * When Auto save happens, we will have this check again
   * Hence any client connecting after will have the same doc
   **/ else {
    const data = getNotes();

    res.json({
      noteId: req.params.id,
      content: data[req.params.id],
      type: 'json',
    });
  }
});

/**
 * Websocket server
 */
let WSServer = WebSocket.Server;
let wss = new WSServer({
  server: server,
  perMessageDeflate: false,
});

wss.on('connection', ws => {
  console.log('New connection');

  ws.on('message', data => {
    const message = JSON.parse(data);
    console.log('Got message:', JSON.parse(data));

    if (message.type === 'update') {
      const noteId = message.noteId;
      /**
       * Check if the note is open ?
       */
      const allOpenNotes = getOpenNotes();
      /**
       * Update openNote DB
       */
      allOpenNotes[noteId] = {
        content: message.update, //base64
      };
      saveOpenNote(allOpenNotes);

      /**
       * Also update main db
       */
      const allNotes = getNotes();
      allNotes[noteId] = message.jsonContent;
      saveNote(allNotes);

      wss.clients.forEach(client => {
        if (client !== ws) {
          client.send(
            JSON.stringify({ type: 'update', update: message.update })
          );
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Connected Clients : ', wss.clients.size);
    if (wss.clients.size === 0) {
      console.log('No more client online - Dropping Open notes DB');
      saveOpenNote({});
      /**
       * We need not do this in platform suite.
       * Maybe we can create a cron job to empty this database every hour/day
       * Even if we clear the db when users are using, we can automatically merge.
       * --Case 1
       * We drop when no one is using  -> Nothing to worry
       * --Case 2
       * We drop when user is using a note
       * - When user saves, we are broadcasting the update which user sends, hence it should automatically merges
       * - And when user connects when OpenNoteDB is empty, we init using json
       */
    }
  });
});

server.on('request', app);

server.listen(PORT, function () {
  console.log(`REST ENDPOINT : http://localhost:${PORT}`);
  console.log(`Websocket ENDPOINT : ws://localhost:${PORT}`);
});

// DB : rdFIAmTz0DDRNlEB
