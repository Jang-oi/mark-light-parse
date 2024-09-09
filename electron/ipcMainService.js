import { ipcMain, shell } from 'electron';
import { execPromise, paths } from './common.js';
import path, { dirname } from 'node:path';
import * as XLSX from 'xlsx';
import fs from 'fs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');

const { illustratorParamPath, illustratorScriptPath, photoshopParamPath, photoshopScriptPath, configFilePath } = paths;
const createResponse = (success, message = '', data = {}) => ({
  success,
  message,
  data,
});
export function setupIpcHandlers() {
  ipcMain.handle('savePath', async (event, pathData) => {
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(pathData));
      return createResponse(true, '경로 저장 완료');
    } catch (error) {
      return createResponse(false, `경로 저장 중 오류 발생 : ${error.message}`);
    }
  });

  ipcMain.handle('savePDF', async (event, templateData, pathData) => {
    try {
      const { illustratorInstallPath } = pathData;
      fs.writeFileSync(illustratorParamPath, JSON.stringify(templateData));

      const extendScriptCommand = `"${illustratorInstallPath}" -r "${illustratorScriptPath}"`;
      await execPromise(extendScriptCommand);

      return createResponse(true, 'PDF 저장 완료');
    } catch (error) {
      return createResponse(false, `PDF 저장 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('saveTIFF', async (event, pdfFileData, pathData) => {
    try {
      const { photoshopInstallPath } = pathData;
      fs.writeFileSync(photoshopParamPath, JSON.stringify(pdfFileData));

      const extendScriptCommand = `"${photoshopInstallPath}" -r ${photoshopScriptPath}`;
      await execPromise(extendScriptCommand);

      return createResponse(true, 'TIFF 저장 완료');
    } catch (error) {
      return createResponse(false, `TIFF 저장 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('savePDFAndTIFF', async (event, templateData, pathData) => {
    try {
      const { illustratorInstallPath, photoshopInstallPath, pdfSavePath } = pathData;
      fs.writeFileSync(illustratorParamPath, JSON.stringify(templateData));

      const illustratorExtendScriptCommand = `"${illustratorInstallPath}" -r "${illustratorScriptPath}"`;
      await execPromise(illustratorExtendScriptCommand);

      const pdfFileData = [
        {
          id: 0,
          name: templateData[0].pdfName,
          path: `${pdfSavePath}${templateData[0].pdfName}.pdf`,
          type: 'application/pdf',
        },
      ];

      fs.writeFileSync(photoshopParamPath, JSON.stringify(pdfFileData));

      const photoshopExtendScriptCommand = `"${photoshopInstallPath}" -r ${photoshopScriptPath}`;
      await execPromise(photoshopExtendScriptCommand);

      return createResponse(true, 'PDF, TIFF 저장 완료');
    } catch (error) {
      return createResponse(false, `PDF, TIFF 저장 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('getConfig', async () => {
    try {
      // 파일이 없으면 빈 파일 생성
      if (!fs.existsSync(configFilePath)) {
        const initJsonString = '{"illustratorInstallPath": "", "pdfSavePath": ""}';
        fs.writeFileSync(configFilePath, initJsonString, 'utf-8');
      }
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return createResponse(true, '', JSON.parse(data));
    } catch (error) {
      return createResponse(false, `경로 조회 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('openFolder', async (event, path) => {
    try {
      await shell.openPath(path);
      return createResponse(true, '');
    } catch (error) {
      return createResponse(false, `폴더 오픈 중 오류 발생: ${error.message}`);
    }
  });

  ipcMain.handle('saveExcludedData', async (event, excludedData, filePath, fileName) => {
    try {
      const excludedFileName = fileName.replace(/\.xlsx?$/, '_제외_데이터.xlsx'); // xlsx 또는 xls 처리
      const dirPath = dirname(filePath);
      const excludedFilePath = path.join(dirPath, excludedFileName);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excludedData);
      XLSX.utils.book_append_sheet(wb, ws, 'Excluded Data');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      fs.writeFileSync(excludedFilePath, wbout);

      return createResponse(true, '');
    } catch (error) {
      return createResponse(false, `파일 저장 중 오류 발생: ${error.message}`);
    }
  });
}

export function setupAutoUpdateHandlers(mainWindow, app) {
  // 업데이트 할 신규 버전이 없을 시 호출 됨
  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-available', '신규 버전 없음');
  });

  // 업데이트 확인 중 에러 발생 시 호출 됨
  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-available', err);
  });

  // 업데이트 할 신규 버전이 있을 시 호출 됨
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available', { isUpdate: true });
  });

  // 업데이트 설치 파일 다운로드 상태 수신
  // 해당 단계까지 자동으로 진행 됨
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download-progress', progressObj);
  });

  // 업데이트 설치 파일 다운로드 완료 시 업데이트 진행 여부 선택
  autoUpdater.on('update-downloaded', () => {
    app.isQuiting = true;
    autoUpdater.quitAndInstall();
  });
}
