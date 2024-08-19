interface PathData {
  illustratorInstallPath: string;
  aiFilePath: string;
  pdfSavePath: string;
  excelSavePath: string;
}

interface TemplateData {
  id: number;
  template: string;
  orderName: string;
  userName: string;
  characterCount: string;
  oldOrderName: string;
}

interface Electron {
  savePath: (pathData: PathData) => Promise<string>;
  savePDF: (templateData: TemplateData[], pathData: PathData) => Promise<string>;
  getUserConfig: () => Promise<PathData>;
}

interface IpcRenderer {
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
  send: (channel: string, ...args: any[]) => void;
  removeListener: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

interface Window {
  electron: Electron;
  ipcRenderer: IpcRenderer;
}
