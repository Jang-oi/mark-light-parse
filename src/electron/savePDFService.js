import { createRequire } from 'module';
import { aiFilePath, IllustratorInstallPath, scriptPath, paramFilePath } from './common.js';
const require = createRequire(import.meta.url);
const { exec } = require('child_process');
const fs = require('fs');

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject({ error: err, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

export default {
  savePDF: async (data) => {
    try {
      // JSON 파일로 파라미터 저장
      fs.writeFileSync(paramFilePath, JSON.stringify(data));

      const extendScriptCommand = `"${IllustratorInstallPath}" -r ${scriptPath}`;
      const aiFileStartCommand = `"${IllustratorInstallPath}" "${aiFilePath}"`;

      // Script 실행
      await execPromise(extendScriptCommand);
      // Illustrator 파일 시작
      await execPromise(aiFileStartCommand);

      return 'PDF 저장 완료!!';
    } catch (e) {
      return e.message;
    }
  },
};