import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { FileWithDimensions } from '@/types/fileTypes.ts';

interface InputFileUploadProps {
  onFileSelect: (files: FileWithDimensions[]) => void;
  onFileReject?: () => void;
  acceptedFileTypes: string[];
  maxFileSize?: number;
  maxFiles?: number;
  label: string;
}

export function InputFileUpload({
  onFileSelect,
  onFileReject,
  acceptedFileTypes,
  maxFileSize,
  maxFiles = 1,
  label,
}: InputFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const validFiles: FileWithDimensions[] = [];
    const errors: string[] = [];

    const imageLoadPromises: Promise<void>[] = [];

    if (selectedFiles.length > maxFiles) {
      errors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
    } else {
      selectedFiles.forEach((file: FileWithDimensions) => {
        if (!acceptedFileTypes.includes(file.type)) {
          errors.push(`${file.name}은(는) 지원되지 않는 파일 형식입니다.`);
        } else if (maxFileSize && file.size > maxFileSize) {
          errors.push(`${file.name}의 크기가 너무 큽니다. 최대 ${maxFileSize / (1024 * 1024)}MB까지 허용됩니다.`);
        } else {
          // 이미지 파일의 경우 사이즈 확인
          if (file.type.startsWith('image/')) {
            const imageLoadPromise = new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                  file.width = img.width;
                  file.height = img.height;
                  validFiles.push(file);
                  resolve(); // 이미지 로드 완료
                };
              };
              reader.readAsDataURL(file);
            });

            // Promise 리스트에 추가
            imageLoadPromises.push(imageLoadPromise);
          } else {
            validFiles.push(file);
          }
        }
      });
    }

    if (errors.length > 0) {
      if (onFileReject) onFileReject();
      errors.forEach((error) => {
        toast({
          variant: 'destructive',
          title: '파일 업로드 오류',
          description: error,
        });
      });
    }

    Promise.all(imageLoadPromises).then(() => {
      if (validFiles.length > 0) onFileSelect(validFiles);
    });

    // Reset the file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(event.target.files);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-center w-full ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-200 hover:bg-gray-100'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 rounded-lg cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(',')}
            multiple={maxFiles > 1}
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
}
