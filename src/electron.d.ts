interface Response {
  success: boolean;
  message: string;
  data: Record<string, any>;
}
interface Electron {
  savePath: (param: Record<string, any>) => Promise<Response>;
  savePDF: (param: Record<string, any>) => Promise<Response>;
  saveTIFF: (param: Record<string, any>) => Promise<Response>;
  getConfig: () => Promise<Response>;
}

interface IpcRenderer {
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
  send: (channel: string, ...args: any[]) => void;
  removeAllListeners: (channel: string) => void;
}

interface Window {
  electron: Electron;
  ipcRenderer: IpcRenderer;
}
