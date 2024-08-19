import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  savePDF: async (templateData, pathData) => {
    return await ipcRenderer.invoke('savePDF', templateData, pathData);
  },
  getUserConfig: async () => {
    return await ipcRenderer.invoke('getUserConfig');
  },
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});