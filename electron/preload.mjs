import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  savePDF: async (templateData, pathData) => {
    return await ipcRenderer.invoke('savePDF', templateData, pathData);
  },
  getUserConfig: async () => {
    return await ipcRenderer.invoke('getUserConfig');
  }
});