import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron';
import electronLocalShortcut from 'electron-localshortcut';
import savePDFService from './savePDFService.js';
import { paths } from './common.js';
import fs from 'fs';

let mainWindow, tray;
const { preloadPath, runPath, trayPath, configFilePath } = paths;

const browserOption = {
  width: 1200,
  height: 960,
  webPreferences: {
    webSecurity: false,
    contextIsolation: true,
    nodeIntegration: true,
    preload: preloadPath,
  },
  autoHideMenuBar: true,
  show: true,
  resizable: false,
  center: true,
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

const createWindow = async () => {
  mainWindow = new BrowserWindow(browserOption);

  await mainWindow.loadURL(runPath);
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    electronLocalShortcut.register(mainWindow, 'F5', () => {
      mainWindow.reload();
    });
    electronLocalShortcut.register(mainWindow, 'Ctrl+F12', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  });
};

const createTray = () => {
  tray = new Tray(trayPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '재시작',
      click: () => {
        app.relaunch();
        app.exit();
      },
    },
    {
      label: '종료',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Mark-Light');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

app.on('ready', () => {
  createWindow();
  createTray();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC 통신 설정
ipcMain.handle('savePDF', async (event, templateData, pathData) => {
  try {
    return await savePDFService.savePDF(templateData, pathData);
  } catch (error) {
    // 에러 발생 시 응답 보내기
    return `PDF 저장 중 오류 발생: ${error.message}`;
  }
});

ipcMain.handle('getUserConfig', () => {
  return JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
});
