import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { Label } from '@/components/ui/label.tsx';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { fileTypeData } from '@/types/fileTypes.ts';
import { useConfigStore } from '@/store/configStore.ts';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

export default function SaveTiffPage() {
  const { configData } = useConfigStore();
  const [pdfFileData, setPdfFileData] = useState<fileTypeData[]>([]);
  const handleAsyncTask = useHandleAsyncTask();

  const handleFileSelect = (acceptedFiles: any) => {
    const filesData: fileTypeData[] = acceptedFiles.map((file: any, index: number) => ({
      id: index,
      name: file.name,
      path: file.path,
      type: file.type,
    }));

    setPdfFileData(filesData);
  };

  const handleFileReject = () => {
    // 오류 발생 시 상태 초기화
    setPdfFileData([]);
  };

  const handleSaveTIFF = async () => {
    await handleAsyncTask({
      validationFunc: () => pdfFileData.length === 0,
      validationMessage: 'PDF 파일이 정상적으로 업로드되어야 합니다.',
      apiFunc: async () => await window.electron.saveTIFF({ pdfFileData, pathData: configData }),
      alertOptions: {},
    });
  };

  return (
    <>
      <Card>
        <CardContent></CardContent>
        <div className="grid gap-6 m-3">
          <Label htmlFor="pdf-upload">PDF Upload</Label>
          <InputFileUpload
            onFileSelect={handleFileSelect}
            onFileReject={handleFileReject}
            acceptedFileTypes={['application/pdf']}
            maxFiles={5}
            label="PDF (최대 5개 까지만 업로드 가능)"
          />
          <CardFooter className="justify-center">
            <Button className="w-full" onClick={handleSaveTIFF}>
              TIFF 저장
            </Button>
          </CardFooter>
          <ScrollArea className="h-80 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파일명</TableHead>
                  <TableHead>파일경로</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfFileData.map((pdfItem: fileTypeData) => (
                  <TableRow key={pdfItem.id}>
                    <TableCell>{pdfItem.name}</TableCell>
                    <TableCell>{pdfItem.path}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>
    </>
  );
}
