import isDev from 'electron-is-dev';
import path from 'path';
import { app, Tray, Menu, BrowserWindow, ipcMain } from 'electron/main';
import electronLocalShortcut from 'electron-localshortcut';
import savePDFService from './savePDFService.js';
import { defaultPath } from './common.js';
const __dirname = path.resolve();

let mainWindow, tray;
const browserOption = {
  width: 1200,
  height: 960,
  webPreferences: {
    webSecurity: false,
    contextIsolation: true,
    nodeIntegration: true,
    preload: path.join(defaultPath, 'preload.mjs'),
  },
  autoHideMenuBar: true,
  show: true,
  resizable: false,
  center: true,
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  app.exit();
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

  console.log(path.join(defaultPath, 'preload.mjs'));
  if (isDev) await mainWindow.loadURL('http://localhost:3000');
  else await mainWindow.loadURL(`file://${path.join(__dirname, 'resources', 'app', 'build', 'index.html')}`);

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    electronLocalShortcut.register(mainWindow, 'F5', () => {
      // mainWindow.webContents.reloadIgnoringCache();
      mainWindow.reload();
    });
    electronLocalShortcut.register(mainWindow, 'Ctrl+F12', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  });
};

const createTray = () => {
  const trayPath = isDev
    ? path.join(defaultPath, 'logo.png')
    : path.join(__dirname, 'resources', 'app', 'src', 'electron', 'logo.png');

  tray = new Tray(trayPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '도움말',
      click: async () => {},
    },
    {
      label: '재시작',
      click: () => {
        app.exit();
        app.relaunch();
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
ipcMain.on('savePDF', async (event, templateData) => {
  try {
    const templateMapping = {
      레이일: '주문일',
      레이이: '주문이',
      레이삼: '주문삼',
      레이사: '주문사',
      레이오: '주문오',
      레이육: '주문육',
      레이칠: '주문칠',
    };
    for (let i = 0; i < templateData.length; i++) {
      templateData[i]['oldOrderName'] = templateMapping[templateData[i]['template']];
    }

    const result = await savePDFService.savePDF(templateData);
    event.reply('pdfSaved', result);
  } catch (error) {
    // 에러 발생 시 응답 보내기
    event.reply('pdfSaved', `PDF 저장 중 오류 발생: ${result}`);
  }
});
