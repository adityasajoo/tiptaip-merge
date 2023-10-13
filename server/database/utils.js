var path = require('path');

/**
 * Main notes -  NotesDB
 */
const dataPath = path.join(__dirname, '../database') + '/notesDb.json';

const fs = require('fs');
const saveNote = data => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

const getNotes = () => {
  const jsonData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(jsonData);
};

/** ------------------------------------------------------ */

/**
 * Notes that are currently Open - OpenNoteDB (Temp Data)
 */
const openNoteDataPath =
  path.join(__dirname, '../database') + '/openNoteDb.json';

/**
 * Get all open notes
 * Notes that are open currently from OpenNoteDB
 */
getOpenNotes = () => {
  const jsonData = fs.readFileSync(openNoteDataPath, 'utf8');
  return JSON.parse(jsonData);
};

const saveOpenNote = data => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(openNoteDataPath, stringifyData);
};

module.exports = {
  saveNote,
  getNotes,
  getOpenNotes,
  saveOpenNote,
};
