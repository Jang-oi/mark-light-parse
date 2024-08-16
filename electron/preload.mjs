import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  savePDF: async (data) => {
    return await ipcRenderer.invoke('savePDF', data);
  }
});
