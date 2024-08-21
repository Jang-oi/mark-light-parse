import { app, BrowserWindow, Tray, Menu, dialog } from 'electron';
import electronLocalShortcut from 'electron-localshortcut';
import isDev from 'electron-is-dev';
import { paths } from './common.js';
import setupIpcHandlers from './ipcMainService.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { autoUpdater } = require('electron-updater');

let mainWindow, tray;
const { preloadPath, runPath, trayPath } = paths;

const browserOption = {
  width: 1200,
  height: 960,
  webPreferences: {
    nodeIntegration: true,
    preload: preloadPath,
  },
  autoHideMenuBar: true,
  show: true,
  resizable: false,
  center: true,
};

// /**
//  * electron-updater는 신규 버전 설치 파일을 자동으로 다운로드 하고 프로그램이 종료되면
//  * 자동으로 설치 파일이 실행되면서 업데이트 되는데
//  * autoInstallOnAppQuite = false 설정으로
//  * 프로그램이 종료되더라도 자동으로 업데이트 되지 않도록 설정 가능하다.
//  */
// autoUpdater.autoInstallOnAppQuit = false;

const gotTheLock = app.requestSingleInstanceLock();

function writeMessageToWindow(text) {
  mainWindow.webContents.send('update-status', text);
}

const autoUpdate = () => {
  /*
  // 신규 버전 릴리즈 확인 시 호출 됨
  autoUpdater.on('checking-for-update', () => {
    writeMessageToWindow('업데이트 확인 중...');
  });
*/

  // 업데이트 할 신규 버전이 있을 시 호출 됨
  autoUpdater.on('update-available', () => {
    writeMessageToWindow('신규 버전 확인 및 업데이트 가능.');
  });

  /*  // 업데이트 할 신규 버전이 없을 시 호출 됨
  autoUpdater.on('update-not-available', () => {
    writeMessageToWindow('신규 버전 없음.');
  });*/

  /*
  // 업데이트 확인 중 에러 발생 시 호출 됨
  autoUpdater.on('error', (err) => {
    writeMessageToWindow('에러 발생 : ' + err);
  });
*/

  // 업데이트 설치 파일 다운로드 상태 수신
  // 해당 단계까지 자동으로 진행 됨
  autoUpdater.on('download-progress', (progressObj) => {
    let progressMsg = 'Downloaded ' + progressObj.percent + '%';
    writeMessageToWindow(progressMsg);
  });

  // 업데이트 설치 파일 다운로드 완료 시 업데이트 진행 여부 선택
  autoUpdater.on('update-downloaded', (info) => {
    writeMessageToWindow('신규 버전 설치 파일 다운로드 완료.');

    const option = {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'UPDATER',
      message: '프로그램 업데이트를 진행하시겠습니까?',
    };

    dialog.showMessageBox(mainWindow, option).then(function (res) {
      writeMessageToWindow(res.response.toString());

      // 위에 option.buttons의 Index = res.response
      if (res.response === 0) {
        writeMessageToWindow('프로그램 종료 및 업데이트');
        autoUpdater.quitAndInstall();
      } else {
        writeMessageToWindow('프로그램 업데이트 안함');
      }
    });
  });
};

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
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.show();
  electronLocalShortcut.register(mainWindow, 'F5', () => {
    mainWindow.reload();
  });
  electronLocalShortcut.register(mainWindow, 'F12', () => {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
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
  setupIpcHandlers();
  // autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
