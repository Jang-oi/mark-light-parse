interface PathData {
  illustratorInstallPath: string;
  aiFilePath: string;
  pdfSavePath: string;
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
  savePDF: (templateData: TemplateData[], pathData: PathData) => Promise<string>;
  getUserConfig: () => Promise<PathData>;
}

interface Window {
  electron: Electron;
}
