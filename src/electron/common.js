import isDev from 'electron-is-dev';
import path from 'path';
const __dirname = path.resolve();

export const defaultPath = isDev ? `${__dirname}\\src\\electron` : `${__dirname}\\resources\\app\\src\\electron`;
export const scriptPath = `"${defaultPath}\\auto_layer_script.jsx"`;
export const paramFilePath = `${defaultPath}\\params.txt`;
export const IllustratorInstallPath =
  'C:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\Illustrator.exe';
export const aiFilePath = 'C:\\Users\\Jang-oi\\Desktop\\test.ai';

// export const scriptPath = 'Z:\\Projects\\mark-right-parse\\mark-right-parse-fe\\src\\electron\\auto_layer_script.jsx';
// export const paramFilePath = 'Z:\\Projects\\mark-right-parse\\mark-right-parse-fe\\src\\electron\\params.txt';
