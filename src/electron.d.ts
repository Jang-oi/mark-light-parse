interface Electron {
    savePDF: (templateData: TemplateData[]) => Promise<string>;
}

interface Window {
    electron: Electron;
}