import { useRef, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { excelFilterArray } from '@/utils/constant.ts';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useConfigStore } from '@/store/configStore.ts';
import { toast } from '@/components/ui/use-toast.ts';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';

const ExcelUploadTemplate = ({ tabVariantType }: any) => {
  const INIT_TYPE = {
    MAX_TEMPLATES: tabVariantType === 'basic' ? 5 : 2,
    INIT_VARIANT_TYPE: tabVariantType === 'basic' ? '1' : '2',
    VARIANT_TYPE_TEXT: tabVariantType === 'basic' ? '베이직' : '대용량',
  };
  const { INIT_VARIANT_TYPE, VARIANT_TYPE_TEXT, MAX_TEMPLATES } = INIT_TYPE;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { configData } = useConfigStore();
  const [excelFilteredData, setExcelFilteredData] = useState<any>([]);
  const [delayTime, setDelayTime] = useState<number>(30);
  // 숫자 추출을 위한 정규 표현식
  const numberPattern = /_(\d{2})/;

  const handleDrop = async (e: any) => {
    const acceptedFiles = e.target.files;
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

        const variantTypeFilteredData = templateFilteredData.filter((item: any) =>
          item['리워드'].includes(VARIANT_TYPE_TEXT),
        );

        // 데이터 변형
        const resultData = variantTypeFilteredData.map((item: any, rowIndex: number) => {
          const match = item['리워드'].match(numberPattern);
          // 정규 표현식 매칭이 없는 경우, 빈 값을 반환하여 오류를 방지합니다.
          const option = match ? `${parseInt(match[1], 10)}` : '0';
          const variantType = INIT_VARIANT_TYPE;
          const characterCount = item['옵션조건'] ? item['옵션조건'].length.toString() : '0';
          const commonNameValue =
            option !== '2' ? `${variantType}${option}${characterCount}` : `${variantType}${option}3`;

          return {
            id: rowIndex,
            template: item['리워드'],
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

  const handleDelayTime = (e: any) => {
    setDelayTime(e.target.value);
  };

  const handleSavePDFExcel = async () => {
    if (delayTime <= 0) {
      toast({ variant: 'destructive', title: '지연시간이 설정되어야 합니다.' });
      return;
    }
    if (excelFilteredData.length <= 0) {
      toast({ variant: 'destructive', title: 'Excel 파일이 비정상적이거나 업로드 되지 않았습니다.' });
      return;
    }

    for (let i = 0; i < excelFilteredData.length; i += MAX_TEMPLATES) {
      const templateData = excelFilteredData.slice(i, i + MAX_TEMPLATES);
      await window.electron.savePDF({ templateData, pathData: configData });
      if (i + MAX_TEMPLATES < excelFilteredData.length) {
        await new Promise((resolve) => setTimeout(resolve, delayTime * 1000));
      }
    }
  };

  console.log(excelFilteredData);
  return (
    <Card>
      <CardContent />
      <div className="grid gap-6 m-3">
        <Label htmlFor="excel">Excel Upload</Label>
        <Input id="excel" type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleDrop} />
        <Label>딜레이 시간 (베이직5개, 대용량2개 저장 시간으로 추천)</Label>
        <Input id="delayTime" type="number" defaultValue={delayTime} onChange={handleDelayTime} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순서</TableHead>
              <TableHead className="w-[400px]">템플릿</TableHead>
              <TableHead>주문자 이름</TableHead>
              <TableHead>사용자 이름</TableHead>
              <TableHead className="w-[100px]">글자수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {excelFilteredData.map((filteredItem: any) => (
              <TableRow key={filteredItem.id}>
                <TableCell>{filteredItem.id + 1}</TableCell>
                <TableCell>{filteredItem.template}</TableCell>
                <TableCell>
                  <Input value={filteredItem.orderName} disabled />
                </TableCell>
                <TableCell>
                  <Input value={filteredItem.mainName} disabled />
                </TableCell>
                <TableCell>
                  <RadioGroup defaultValue={filteredItem.characterCount} disabled>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="2" />
                      <Label>2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="3" />
                      <Label>3</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={handleSavePDFExcel}>
            PDF 저장
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ExcelUploadTemplate;
