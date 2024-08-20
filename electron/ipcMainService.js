import { ipcMain } from 'electron';
import { execPromise, paths } from './common.js';
import fs from 'fs';

const { paramFilePath, scriptPath, configFilePath } = paths;
const createResponse = (success, message = '', data = {}) => ({
  success,
  message,
  data,
});
export default function setupIpcHandlers() {
  ipcMain.handle('savePath', async (event, pathData) => {
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(pathData));
      return createResponse(true, '경로 저장 완료');
    } catch (error) {
      return createResponse(false, `경로 저장 중 오류 발생 : ${error.message}`);
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
      return createResponse(true, 'PDF 저장 완료');
    } catch (error) {
      return createResponse(false, `PDF 저장 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('getConfig', async () => {
    try {
      // 파일이 없으면 빈 파일 생성
      if (!fs.existsSync(configFilePath)) {
        const initJsonString =
          '{"illustratorInstallPath": "", "aiFilePath": "", "pdfSavePath": "", "excelSavePath" : ""}';
        fs.writeFileSync(configFilePath, initJsonString, 'utf-8');
      }
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return createResponse(true, '', JSON.parse(data));
    } catch (error) {
      return createResponse(false, `경로 조회 중 오류 발생: ${error.message}`);
    }
  });
}
