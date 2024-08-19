import { ipcMain } from 'electron';
import { execPromise, paths } from './common.js';
import fs from 'fs';

const { paramFilePath, scriptPath, configFilePath } = paths;

export default function setupIpcHandlers() {
  ipcMain.handle('savePath', async (event, pathData) => {
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(pathData));
      return '경로 저장 완료';
    } catch (error) {
      return `경로 저장 중 오류 발생: ${error.message}`;
    }
  });

  // IPC 통신 설정
  ipcMain.handle('savePDF', async (event, templateData, pathData) => {
    try {
      const { illustratorInstallPath, aiFilePath } = pathData;
      fs.writeFileSync(paramFilePath, JSON.stringify(templateData));

      const extendScriptCommand = `"${illustratorInstallPath}" -r ${scriptPath}`;
      const aiFileStartCommand = `"${illustratorInstallPath}" "${aiFilePath}"`;

      // Script 실행
      await execPromise(extendScriptCommand);
      // Illustrator 파일 시작
      await execPromise(aiFileStartCommand);
      return 'PDF 저장 완료';
    } catch (error) {
      return `PDF 저장 중 오류 발생: ${error.message}`;
    }
  });

  ipcMain.handle('savePDFExcel', async (event, templateData, pathData) => {
    try {
      const { illustratorInstallPath, aiFilePath } = pathData;
      fs.writeFileSync(paramFilePath, JSON.stringify(templateData));

      const extendScriptCommand = `"${illustratorInstallPath}" -r ${scriptPath}`;
      const aiFileStartCommand = `"${illustratorInstallPath}" "${aiFilePath}"`;

      // Script 실행
      await execPromise(extendScriptCommand);
      // Illustrator 파일 시작
      await execPromise(aiFileStartCommand);
      return 'PDF 저장 완료';
    } catch (error) {
      return `PDF 저장 중 오류 발생: ${error.message}`;
    }
  });

  ipcMain.handle('getUserConfig', async () => {
    try {
      // 파일이 없으면 빈 파일 생성
      if (!fs.existsSync(configFilePath)) {
        const initJsonString =
          '{"illustratorInstallPath": "", "aiFilePath": "", "pdfSavePath": "", "excelSavePath" : ""}';
        fs.writeFileSync(configFilePath, initJsonString, 'utf-8');
      }
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading or creating the config file:', error);
      return null; // 에러가 발생하면 null 반환
    }
  });
}
