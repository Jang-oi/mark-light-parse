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
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { ExcelTemplateData } from '@/types/templateTypes.ts';
import { validateFiles } from '@/utils/fileUtil.ts';
import { Switch } from '@/components/ui/switch.tsx';

const SaveBulkExcelTemplate = ({ tabVariantType }: any) => {
  const INIT_TYPE = {
    MAX_TEMPLATES: tabVariantType === 'basic' ? 5 : 2,
    INIT_VARIANT_TYPE: tabVariantType === 'basic' ? '1' : '2',
    VARIANT_TYPE_TEXT: tabVariantType === 'basic' ? '베이직' : '대용량',
  };
  const { INIT_VARIANT_TYPE, VARIANT_TYPE_TEXT, MAX_TEMPLATES } = INIT_TYPE;

  const fileInputRef = useRef<any>(null);
  const { configData } = useConfigStore();
  const handleAsyncTask = useHandleAsyncTask();
  const [excelFilteredData, setExcelFilteredData] = useState<ExcelTemplateData[]>([]);
  const [checked, setChecked] = useState(true);
  // 숫자 추출을 위한 정규 표현식
  const numberPattern = /_(\d{2})/;
  const handleSwitchValue = (checked: boolean) => {
    setChecked(checked);
  };
  const handleDrop = async (e: any) => {
    const acceptedFiles = e.target.files;
    const { valid, message } = validateFiles(
      acceptedFiles,
      1,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    if (!valid) {
      toast({
        variant: 'destructive',
        title: '파일 업로드 오류',
        description: message,
      });
      fileInputRef.current.value = '';
      setExcelFilteredData([]);
      return;
    }

    const file = acceptedFiles[0];
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

      // 베이직, 대용량 구분
      const variantTypeFilteredData = templateFilteredData.filter((item: any) =>
        item['리워드'].includes(VARIANT_TYPE_TEXT),
      );

      // 옵션조건에서 공백 제거 후 길이를 계산하여 4글자 이하인 경우만
      const characterCountFilteredData = variantTypeFilteredData.filter((item: any) => {
        const cleanedOption = item['옵션조건'].replace(/\s+/g, ''); // 모든 공백 제거
        return cleanedOption.length <= 4;
      });

      // 수량이 1개인 경우만
      const countFilteredData = characterCountFilteredData.filter((item: any) => item['수량'] === 1);

      // 데이터 변형
      const resultData = countFilteredData.map((item: any, rowIndex: number) => {
        const match = item['리워드'].match(numberPattern);
        // 정규 표현식 매칭이 없는 경우, 빈 값을 반환하여 오류를 방지합니다.
        const option = match ? `${parseInt(match[1], 10)}` : '0';
        const variantType = INIT_VARIANT_TYPE;
        const mainName = item['옵션조건'].replace(/\s+/g, ''); // 공백 제거
        const characterCount = mainName.length.toString();

        let commonNameValue = `${variantType}${option}${characterCount}`;
        if (option !== '2') commonNameValue = `${variantType}${option}3`;

        return {
          id: rowIndex,
          no: item['No.'],
          template: item['리워드'],
          option,
          orderName: item['받는사람 성명'],
          mainName,
          fundingNumber: item['펀딩번호'],
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
  };

  const handleSavePDFExcel = async () => {
    await handleAsyncTask({
      validationFunc: () => excelFilteredData.length < 0,
      validationMessage: 'Excel 파일이 정상적으로 업로드되어야 합니다.',
      alertOptions: {},
      apiFunc: async () => {
        let response;
        for (let i = 0; i < excelFilteredData.length; i += MAX_TEMPLATES) {
          const templateData = excelFilteredData.slice(i, i + MAX_TEMPLATES);
          const pdfName = templateData.map((item) => item.no).join('_');
          templateData.forEach((item) => (item.pdfName = pdfName));
          if (checked) {
            response = await window.electron.savePDFAndTIFF({ templateData, pathData: configData });
          } else {
            response = await window.electron.savePDF({ templateData, pathData: configData });
          }
        }
        if (response?.success && checked) await window.electron.openFolder(configData.tiffSavePath);
        return response;
      },
    });
  };

  return (
    <Card>
      <CardContent />
      <div className="grid gap-6 m-3">
        <Label htmlFor="excel">Excel Upload</Label>
        <Input id="excel" type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleDrop} />
        <CardFooter>
          <div className="flex items-center w-80">
            <Switch checked={checked} onCheckedChange={handleSwitchValue} />
            <Label htmlFor="airplane-mode" className="m-4">
              TIFF 자동 저장
            </Label>
          </div>
          <Button className="m-4 w-full" onClick={handleSavePDFExcel}>
            PDF 저장
          </Button>
        </CardFooter>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead className="w-[350px]">템플릿</TableHead>
              <TableHead>수령자</TableHead>
              <TableHead>인쇄문구</TableHead>
              <TableHead>펀딩번호</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {excelFilteredData.map((filteredItem: ExcelTemplateData) => (
              <TableRow key={filteredItem.id}>
                <TableCell>{filteredItem.no}</TableCell>
                <TableCell>{filteredItem.template}</TableCell>
                <TableCell>
                  <Input value={filteredItem.orderName} disabled />
                </TableCell>
                <TableCell>
                  <Input value={filteredItem.mainName} disabled />
                </TableCell>
                <TableCell>
                  <Input value={filteredItem.fundingNumber} disabled />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default SaveBulkExcelTemplate;
