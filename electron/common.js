import isDev from 'electron-is-dev';
import path from 'node:path';
const __dirname = path.resolve();

const basePaths = {
  dev: path.join(__dirname, 'electron'),
  prod: path.join(__dirname, 'resources', 'app', 'electron'),
};

const currentPaths = isDev ? basePaths.dev : basePaths.prod;

export const paths = {
  currentPaths,
  scriptPath: path.join(currentPaths, 'auto_layer_script.jsx'),
  paramFilePath: path.join(currentPaths, 'params.json'),
  runPath: isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'resources', 'app', 'build', 'index.html')}`,
  preloadPath: path.join(currentPaths, 'preload.mjs'),
  trayPath: path.join(currentPaths, 'logo.png'),
  configFilePath: path.join(currentPaths, 'userConfig.json'),
};
