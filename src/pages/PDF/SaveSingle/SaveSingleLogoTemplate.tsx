import { CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { fileTypeData } from '@/types/fileTypes';
import { Image as ImageIcon } from 'lucide-react';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';

export default function SaveSingleLogoTemplate() {
  const [pngFileData, setPngFileData] = useState<fileTypeData[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (acceptedFiles: any) => {
    const filesData: fileTypeData[] = acceptedFiles.map((file: any, index: number) => ({
      id: index,
      name: file.name,
      path: file.path,
      type: file.type,
    }));

    setPngFileData(filesData);

    // Create preview URL for the first PNG file
    if (acceptedFiles[0] && acceptedFiles[0].type === 'image/png') {
      const url = URL.createObjectURL(acceptedFiles[0]);
      setPreviewUrl(url);
    }
  };

  const handleFileReject = () => {
    // 오류 발생 시 상태 초기화
    setPngFileData([]);
    setPreviewUrl(null);
  };

  console.log(pngFileData);

  return (
    <>
      <CardContent className="mt-6 space-y-8">
        <InputFileUpload
          onFileSelect={handleFileSelect}
          onFileReject={handleFileReject}
          acceptedFileTypes="image/png"
          maxFileSize={10 * 1024 * 1024} // 10MB
          label="PNG (최대 10MB 까지만 업로드 가능)"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full max-w-md">
              <img src={previewUrl} alt="PNG Preview" className="rounded-lg object-contain w-full h-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-gray-200 border-dashed rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500">이미지를 업로드하면 여기에 미리보기가 표시됩니다.</p>
          </div>
        )}
      </CardContent>
    </>
  );
}
