import { CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';
import { useSingleTemplateLogoStore } from '@/store/singleTemplateLogoStore.ts';
import { getDateFormat } from '@/utils/helper.ts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel.tsx';

export default function SaveSingleLogoTemplate() {
  const { setLogoImageData } = useSingleTemplateLogoStore();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (acceptedFiles: File[]) => {
    const filesData = acceptedFiles.map((file: any) => ({
      name: file.name,
      path: file.path,
      pdfName: getDateFormat(),
    }));

    setLogoImageData(filesData);
    const previewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previewUrls);
  };

  const handleFileReject = () => {
    // 오류 발생 시 상태 초기화
    setLogoImageData([]);
    setPreviewUrls([]);
  };

  return (
    <>
      <CardContent className="mt-6 space-y-8">
        <InputFileUpload
          onFileSelect={handleFileSelect}
          onFileReject={handleFileReject}
          acceptedFileTypes={['image/png']}
          maxFileSize={10 * 1024 * 1024} // 10MB
          label="PNG (최대 10MB, 최대 5개 파일 업로드 가능)"
          maxFiles={5}
        />
        {previewUrls.length > 0 ? (
          <Carousel className="w-full max-w-lg mx-auto">
            <CarouselContent>
              {previewUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative p-1">
                    <img
                      src={url}
                      alt={`PNG 미리보기 ${index + 1}`}
                      className="rounded-lg object-contain w-full h-64"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500">이미지를 업로드하면 여기에 미리보기가 표시됩니다.</p>
          </div>
        )}
      </CardContent>
    </>
  );
}
