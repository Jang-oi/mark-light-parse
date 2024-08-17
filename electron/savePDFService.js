import { paths } from './common.js';
import { exec } from 'child_process';
import fs from 'fs';

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
  savePDF: async (templateData, pathData) => {
    try {
      const { paramFilePath, scriptPath, configFilePath } = paths;
      const { illustratorInstallPath, aiFilePath } = pathData;

      fs.writeFileSync(paramFilePath, JSON.stringify(templateData));
      fs.writeFileSync(configFilePath, JSON.stringify(pathData));

      const extendScriptCommand = `"${illustratorInstallPath}" -r ${scriptPath}`;
      const aiFileStartCommand = `"${illustratorInstallPath}" "${aiFilePath}"`;

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
