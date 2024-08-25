import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  savePath: async (pathData) => {
    return await ipcRenderer.invoke('savePath', pathData);
  },
  savePDF: async ({templateData, pathData}) => {
    return await ipcRenderer.invoke('savePDF', templateData, pathData);
  },
  saveTIFF: async ({pdfFileData,pathData}) => {
    return await ipcRenderer.invoke('saveTIFF', pdfFileData, pathData);
  },
  getConfig: async () => {
    return await ipcRenderer.invoke('getConfig');
  },
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});