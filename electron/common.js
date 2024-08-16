import isDev from 'electron-is-dev';
import path from 'node:path'
const __dirname = path.resolve();

// Define base paths
const basePaths = {
    dev: path.join(__dirname, 'electron'),
    prod: path.join(__dirname, 'resources', 'app', 'electron'),
};
// Determine the current environment paths
const currentPaths = isDev ? basePaths.dev : basePaths.prod;

export const paths = {
    currentPaths,
    scriptPath: path.join(currentPaths, 'auto_layer_script.jsx'),
    paramFilePath: path.join(currentPaths, 'params.txt'),
    runPath: isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'resources', 'app', 'build', 'index.html')}`,
    preloadPath: path.join(currentPaths, 'preload.mjs'),
    trayPath: path.join(currentPaths, 'logo.png'),
};

// User-specific paths
export const userPaths = {
    illustratorInstallPath: 'C:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\Illustrator.exe',
    aiFilePath: 'C:\\Users\\Jang-oi\\Desktop\\test.ai',
};