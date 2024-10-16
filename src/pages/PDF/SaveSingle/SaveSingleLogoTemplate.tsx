import { CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';
import { useSingleTemplateLogoStore } from '@/store/singleTemplateLogoStore.ts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoData } from '@/types/templateTypes.ts';
import { FileWithDimensions } from '@/types/fileTypes.ts';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

export default function SaveSingleLogoTemplate() {
  const { logoImageData, setLogoImageData } = useSingleTemplateLogoStore();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (acceptedFiles: FileWithDimensions[]) => {
    const filesData = acceptedFiles.map((file: any) => ({
      name: file.name,
      path: file.path,
      height: file.height,
      width: file.width,
      option: '',
      fundingNumber: '',
      orderNames: '',
    }));

    setLogoImageData(filesData);
    const newPreviewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleFileReject = () => {
    setLogoImageData([]);
    setPreviewUrls([]);
  };

  const handleDataChange = (index: number, field: keyof LogoData, value: string) => {
    const newData = [...logoImageData];
    newData[index] = { ...newData[index], [field]: value };
    setLogoImageData(newData);
  };

  return (
    <>
      <CardContent className="mt-6 space-y-4">
        <InputFileUpload
          onFileSelect={handleFileSelect}
          onFileReject={handleFileReject}
          acceptedFileTypes={['image/png']}
          maxFileSize={10 * 1024 * 1024} // 10MB
          label="PNG (최대 10MB, 최대 5개 파일 업로드 가능)"
          maxFiles={5}
        />
        {previewUrls.length > 0 ? (
          <ScrollArea className="h-80 rounded-md border">
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {previewUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative p-2 space-y-4 rounded-lg shadow-md">
                      <img
                        src={url}
                        alt={`PNG 미리보기 ${index + 1}`}
                        className="rounded-lg object-contain w-full h-40 mb-4"
                      />
                      <div className="grid gap-4 grid-cols-3">
                        <div className="space-y-2 w-full">
                          <Label htmlFor={`option-${index}`}>옵션 선택</Label>
                          <Select
                            onValueChange={(value) => handleDataChange(index, 'option', value)}
                            value={logoImageData[index]?.option}
                          >
                            <SelectTrigger id={`option-${index}`}>
                              <SelectValue placeholder="옵션을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S_40X20">S_40X20</SelectItem>
                              <SelectItem value="S_60X30">S_60X30</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`number-${index}`}>송장번호 입력</Label>
                          <Input
                            id={`number-${index}`}
                            placeholder="송장번호 입력하세요"
                            value={logoImageData[index]?.fundingNumber}
                            onChange={(e) => handleDataChange(index, 'fundingNumber', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`text-${index}`}>수령자 입력</Label>
                          <Input
                            id={`text-${index}`}
                            type="text"
                            placeholder="수령자를 입력하세요"
                            value={logoImageData[index]?.orderNames}
                            onChange={(e) => handleDataChange(index, 'orderNames', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </ScrollArea>
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
