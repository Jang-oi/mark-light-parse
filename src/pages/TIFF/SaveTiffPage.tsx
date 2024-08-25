import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { validateFiles } from '@/utils/fileUtil.ts';
import { fileTypeData } from '@/types/fileTypes.ts';
import { useConfigStore } from '@/store/configStore.ts';

export default function SaveTiffPage() {
  const fileInputRef = useRef<any>(null);
  const { configData } = useConfigStore();
  const [pdfFileData, setPdfFileData] = useState<fileTypeData[]>([]);
  const handleAsyncTask = useHandleAsyncTask();

  const handleDrop = async (e: any) => {
    const acceptedFiles = e.target.files;
    const filesData: fileTypeData[] = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      filesData.push({ id: i, name: file.name, path: file.path, type: file.type });
    }

    const { valid, message } = validateFiles(filesData, 5, 'application/pdf');

    if (!valid) {
      toast({
        variant: 'destructive',
        title: '파일 업로드 오류',
        description: message,
      });
      fileInputRef.current.value = '';
      setPdfFileData([]);
      return;
    }

    setPdfFileData(filesData);
  };

  const handleSaveTIFF = async () => {
    await handleAsyncTask({
      validationFunc: () => fileInputRef.current.value === '',
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
          <Label htmlFor="excel">PDF Upload</Label>
          <Input id="excel" type="file" accept=".pdf" ref={fileInputRef} multiple onChange={handleDrop} />
          <CardFooter className="justify-center">
            <Button className="w-full" onClick={handleSaveTIFF}>
              TIFF 저장
            </Button>
          </CardFooter>
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
        </div>
      </Card>
    </>
  );
}
