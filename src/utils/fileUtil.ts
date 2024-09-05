import { fileTypeData } from '@/types/fileTypes.ts';

export const validateFiles = (files: fileTypeData[], maxFiles: number, allowedTypes: string[]) => {
  // 파일 개수 제한
  if (files.length > maxFiles) {
    return {
      valid: false,
      message: `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`,
    };
  }

  // 파일 형식 검증
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: `정상적인 파일 형식만 업로드할 수 있습니다. 허용된 형식: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true, message: '' };
};
