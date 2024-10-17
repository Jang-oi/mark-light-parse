import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electron', {
  savePath: async (pathData) => {
    return await ipcRenderer.invoke('savePath', pathData);
  },
  saveTIFF: async ({pdfFileData,pathData}) => {
    return await ipcRenderer.invoke('saveTIFF', pdfFileData, pathData);
  },
  savePDF: async ({templateData, pathData}) => {
    return await ipcRenderer.invoke('savePDF', templateData, pathData);
  },
  savePDFAndTIFF : async ({templateData, pathData}) => {
    return await ipcRenderer.invoke('savePDFAndTIFF', templateData, pathData);
  },
  getConfig: async () => {
    return await ipcRenderer.invoke('getConfig');
  },
  openFolder : async (path) => {
    return await ipcRenderer.invoke('openFolder', path);
  },
  saveExcludedData: async ({excludedData, filePath, fileName}) => {
    return await ipcRenderer.invoke('saveExcludedData', excludedData , filePath, fileName);
  },
  saveLogoPDF: async ({updatedLogoImageData, pathData}) => {
    return await ipcRenderer.invoke('saveLogoPDF', updatedLogoImageData, pathData);
  },
  saveLogoPDFAndTIFF : async ({updatedLogoImageData, pathData}) => {
    return await ipcRenderer.invoke('saveLogoPDFAndTIFF', updatedLogoImageData, pathData);
  },
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});