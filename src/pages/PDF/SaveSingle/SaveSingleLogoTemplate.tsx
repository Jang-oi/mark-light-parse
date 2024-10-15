import { CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';
import { useSingleTemplateLogoStore } from '@/store/singleTemplateLogoStore.ts';
import { getDateFormat } from '@/utils/helper.ts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageData {
  option: string;
  fundingNumber: string;
  orderNames: string;
}

export default function SaveSingleLogoTemplate() {
  const { setLogoImageData } = useSingleTemplateLogoStore();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageData, setImageData] = useState<ImageData[]>([]);

  const handleFileSelect = (acceptedFiles: File[]) => {
    const filesData = acceptedFiles.map((file: any) => ({
      name: file.name,
      path: file.path,
      pdfName: getDateFormat(),
    }));

    setLogoImageData(filesData);
    const newPreviewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    setImageData(new Array(newPreviewUrls.length).fill({ option: '', numberInput: '', textInput: '' }));
  };

  const handleFileReject = () => {
    setLogoImageData([]);
    setPreviewUrls([]);
    setImageData([]);
  };

  const handleDataChange = (index: number, field: keyof ImageData, value: string) => {
    const newData = [...imageData];
    newData[index] = { ...newData[index], [field]: value };
    setImageData(newData);
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
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {previewUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative p-6 space-y-4 rounded-lg shadow-md">
                    <img
                      src={url}
                      alt={`PNG 미리보기 ${index + 1}`}
                      className="rounded-lg object-contain w-full h-64 mb-4"
                    />
                    <div className="grid gap-4">
                      <div className="space-y-2 w-full">
                        <Label htmlFor={`option-${index}`}>옵션 선택</Label>
                        <Select
                          onValueChange={(value) => handleDataChange(index, 'option', value)}
                          value={imageData[index]?.option}
                        >
                          <SelectTrigger id={`option-${index}`}>
                            <SelectValue placeholder="옵션을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">S_40X20</SelectItem>
                            <SelectItem value="option2">S_60X30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`number-${index}`}>송장번호 입력</Label>
                        <Input
                          id={`number-${index}`}
                          placeholder="송장번호 입력하세요"
                          value={imageData[index]?.fundingNumber}
                          onChange={(e) => handleDataChange(index, 'fundingNumber', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`text-${index}`}>수령자 입력</Label>
                      <Input
                        id={`text-${index}`}
                        type="text"
                        placeholder="수령자를 입력하세요"
                        value={imageData[index]?.orderNames}
                        onChange={(e) => handleDataChange(index, 'orderNames', e.target.value)}
                      />
                    </div>
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
