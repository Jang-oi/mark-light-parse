
interface Electron {
    savePDF: (templateData: TemplateData[]) => void;
    onPDFSaved: (callback: (message: string) => void) => void;
}

interface Window {
    electron: Electron;
}