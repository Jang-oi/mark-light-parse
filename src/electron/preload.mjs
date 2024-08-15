const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  savePDF: (data) => ipcRenderer.send('savePDF', data),
  onPDFSaved: (callback) => ipcRenderer.on('pdfSaved', (event, message) => callback(message)),
});
