import isDev from 'electron-is-dev';
import path from 'node:path';
import { exec } from 'child_process';
const __dirname = path.resolve();

const basePaths = {
  dev: path.join(__dirname, 'electron'),
  prod: path.join(__dirname, 'resources', 'app', 'electron'),
};

const currentPaths = isDev ? basePaths.dev : basePaths.prod;

export const paths = {
  currentPaths,
  illustratorScriptPath: path.join(currentPaths, 'illustrator_script.jsx'),
  photoshopScriptPath: path.join(currentPaths, 'photoshop_script.jsx'),
  logoSaveScriptPath: path.join(currentPaths, 'logoSave_script.jsx'),
  illustratorParamPath: path.join(currentPaths, 'illustratorParams.json'),
  photoshopParamPath: path.join(currentPaths, 'photoshopParams.json'),
  logoSaveParamPath: path.join(currentPaths, 'logoSaveParams.json'),
  runPath: isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'resources', 'app', 'build', 'index.html')}`,
  preloadPath: path.join(currentPaths, 'preload.mjs'),
  trayPath: path.join(currentPaths, 'logo.png'),
  configFilePath: path.join(currentPaths, 'userConfig.json'),
};

export const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject({ error: err, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
};
