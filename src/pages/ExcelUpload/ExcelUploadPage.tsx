import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
// import { useConfigStore } from '@/store/configStore.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import * as XLSX from 'xlsx';
import { toast } from '@/components/ui/use-toast.ts';
import { useRef, useState } from 'react';
import { excelFilterArray } from '@/utils/constant.ts';
import { useConfigStore } from '@/store/configStore.ts';

const ExcelUploadPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { configData } = useConfigStore();
  const [excelFilteredData, setExcelFilteredData] = useState<any>([]);
  // 숫자 추출을 위한 정규 표현식
  const numberPattern = /_(\d{2})/;
  // const { pathData, setPathData } = useConfigStore();

  const handleDrop = async (acceptedFiles: any) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast({
          variant: 'destructive',
          title: 'Excel File 을 업로드 해주세요.',
          description: '정상 적인 Excel 파일이 아닙니다.',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', bookVBA: true });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // 리워드가 _01~_07 템플릿인지
        const templateFilteredData = jsonData.filter((item: any) =>
          excelFilterArray.some((filter) => item['리워드'].includes(filter)),
        );

        const variantTypeFilteredData = templateFilteredData.filter((item: any) => !item['리워드'].includes('대용량'));

        // 데이터 변형
        const resultData = variantTypeFilteredData.map((item: any, rowIndex: number) => {
          const match = item['리워드'].match(numberPattern);
          // 정규 표현식 매칭이 없는 경우, 빈 값을 반환하여 오류를 방지합니다.
          const option = match ? `${parseInt(match[1], 10)}` : '0';

          const variantType = item['리워드'].includes('대용량') ? '2' : '1';
          const characterCount = item['옵션조건'] ? item['옵션조건'].length.toString() : '0';
          const commonNameValue =
            option !== '2' ? `${variantType}${option}${characterCount}` : `${variantType}${option}3`;

          return {
            id: rowIndex,
            option,
            orderName: item['받는사람 성명'],
            mainName: item['옵션조건'],
            characterCount,
            variantType,
            layerName: commonNameValue,
            _orderName: `N${commonNameValue}`,
            _mainName: commonNameValue,
          };
        });

        setExcelFilteredData(resultData);
        toast({ title: 'Excel Upload 완료' });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleSavePDFExcel = async () => {
    // 데이터 개수를 10개로 제한
    if (excelFilteredData.length <= 0) {
      toast({ variant: 'destructive', title: 'Excel 파일이 비정상적이거나 업로드 되지 않았습니다.' });
      return;
    }

    for (let i = 0; i < excelFilteredData.length; i += 5) {
      const templateData = excelFilteredData.slice(i, i + 5);
      console.log(templateData);
      await window.electron.savePDF({ templateData, pathData: configData });
      if (i + 5 < excelFilteredData.length) {
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
  };

  return (
    <>
      <Card>
        <CardContent />
        <div className="grid gap-6 m-3">
          <Label htmlFor="excel">Excel Upload</Label>
          <Input
            id="excel"
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={(e) => handleDrop(e.target.files)}
          />
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={handleSavePDFExcel}>
              PDF 저장
            </Button>
          </CardFooter>
        </div>
      </Card>
    </>
  );
};

export default ExcelUploadPage;
