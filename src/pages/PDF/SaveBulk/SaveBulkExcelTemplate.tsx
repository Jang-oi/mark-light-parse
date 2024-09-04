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
import { useLoadingStore } from '@/store/loadingStore.ts';

const SaveBulkExcelTemplate = () => {
  const getVariantType = (variantValue: string) => {
    return {
      MAX_TEMPLATES: variantValue === '베이직' ? 5 : 2,
      INIT_VARIANT_TYPE: variantValue === '베이직' ? '1' : '2',
      VARIANT_TYPE_TEXT: variantValue === '베이직' ? '베이직' : '대용량',
    };
  };

  const fileInputRef = useRef<any>(null);
  const { configData } = useConfigStore();
  const { startLoading, stopLoading } = useLoadingStore();
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

    const ezAdminExcelUploadData = (jsonData: any) => {
      return jsonData.filter((item: any, rowIndex: number) => {
        if (!item['판매처 옵션']) return;
        if (!item['상품명'].includes('베이직') && !item['상품명'].includes('대용량')) return;

        let isMainNaim = false;
        const [mainNamePart, variantPart, templatePart] = item['판매처 옵션'].split(' / ');
        const mainName = mainNamePart.split(': ')[1];
        const variant = variantPart.split(': ')[1];
        const template = templatePart.split(': ')[1];

        // 01~09 템플릿인지 확인
        const templateNumber = parseInt(template.substring(0, 2), 10);
        const isTemplate = templateNumber >= 1 && templateNumber <= 8;

        // 1 ~ 7 템플릿은 이름에서 공백 제거 후 길이를 계산하여 4글자 이하인 경우만
        if (templateNumber <= 7) {
          const cleanedOption = mainName.replace(/\s+/g, '');
          isMainNaim = cleanedOption.length <= 4;
        } else if (templateNumber === 8) {
          // 영어 대소문자, 공백, 쉼표, 마침표, 백틱만 허용
          const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
          if (isEnglishOnly && mainName.length <= 11) isMainNaim = true;
        } else if (templateNumber === 9) {
          // mainName이 22글자 이하, subName이 4글자 이하이어야 함
          // 엑셀에서 subName 난감해서 못하는 중
        }

        const isItemCount = item['주문수량'] === 1;

        if (isMainNaim && isTemplate && isItemCount) {
          const { INIT_VARIANT_TYPE } = getVariantType(variant);
          let characterCount = mainName.length.toString();

          let layerName;
          if (templateNumber === 2) {
            // 2 템플릿
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
          } else if (templateNumber < 8) {
            // 1, 3~7 템플릿
            characterCount = Number(characterCount) < 4 ? '3' : '4';
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
          } else {
            // 8~9 템플릿
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}9`;
          }

          item.id = rowIndex;
          item.no = item['관리번호'];
          item.template = item['판매처 옵션'];
          item.option = `${templateNumber}`;
          item.orderName = item['수령자이름'];
          item.mainName = mainName;
          item.fundingNumber = item['송장번호'];
          item.characterCount = characterCount;
          item.variantType = INIT_VARIANT_TYPE;
          item.layerName = layerName;

          return true;
        }
      });
    };
    const wadizExcelUploadData = (jsonData: any) => {
      // 리워드가 _01~_09 템플릿인지
      const templateFilteredData = jsonData.filter((item: any) =>
        excelFilterArray.some((filter) => item['리워드'].includes(filter)),
      );

      // 옵션조건에서 공백 제거 후 길이를 계산하여 4글자 이하인 경우만
      const characterCountFilteredData = templateFilteredData.filter((item: any) => {
        const cleanedOption = item['옵션조건'].replace(/\s+/g, ''); // 모든 공백 제거
        return cleanedOption.length <= 4;
      });

      // 수량이 1개인 경우만
      const countFilteredData = characterCountFilteredData.filter((item: any) => item['수량'] === 1);

      // 데이터 변형
      return countFilteredData.map((item: any, rowIndex: number) => {
        const match = item['리워드'].match(numberPattern);
        // 정규 표현식 매칭이 없는 경우, 빈 값을 반환하여 오류를 방지합니다.
        let INIT_VARIANT_TYPE;
        if (item['리워드'].includes('베이직')) {
          INIT_VARIANT_TYPE = getVariantType('베이직').INIT_VARIANT_TYPE;
        } else if (item['리워드'].includes('대용량')) {
          INIT_VARIANT_TYPE = getVariantType('대용량').INIT_VARIANT_TYPE;
        }

        const option = match ? `${parseInt(match[1], 10)}` : '0';
        const templateNumber = Number(option);
        const mainName = item['옵션조건'];

        let characterCount = mainName.length.toString();

        let layerName;
        if (templateNumber === 2) {
          // 2 템플릿
          layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
        } else if (templateNumber < 8) {
          // 1, 3~7 템플릿
          characterCount = Number(characterCount) < 4 ? '3' : '4';
          layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
        } else {
          // 8~9 템플릿
          layerName = `${INIT_VARIANT_TYPE}${templateNumber}9`;
        }

        return {
          id: rowIndex,
          no: item['No.'],
          template: item['리워드'],
          option,
          orderName: item['받는사람 성명'],
          mainName,
          fundingNumber: item['펀딩번호'],
          characterCount,
          variantType: INIT_VARIANT_TYPE,
          layerName,
        };
      });
    };

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', bookVBA: true });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      let resultData;
      if (file.name.includes('확장주문')) {
        resultData = ezAdminExcelUploadData(jsonData);
      } else {
        resultData = wadizExcelUploadData(jsonData);
      }

      setExcelFilteredData(resultData);
      toast({ title: 'Excel Upload 완료' });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSavePDFExcel = async () => {
    const excelFilteredDataLength = excelFilteredData.length;

    await handleAsyncTask({
      validationFunc: () => excelFilteredDataLength < 0,
      validationMessage: 'Excel 파일이 정상적으로 업로드되어야 합니다.',
      alertOptions: {},
      useLoading: false,
      apiFunc: async () => {
        // 그룹화된 결과를 저장할 객체
        const grouped: Record<string, ExcelTemplateData[]> = {
          variantType1: [],
          variantType2: [],
          variantType3: [],
        };
        // 배열을 순회하면서 각 객체를 해당 variantType에 맞는 배열에 넣음
        excelFilteredData.forEach((item: ExcelTemplateData) => {
          grouped[`variantType${item.variantType}`].push(item);
        });

        // 공통 작업을 수행하는 함수
        const processTemplates = async (templates: ExcelTemplateData[], options: any) => {
          let response;

          for (let i = 0; i < templates.length; i += options.MAX_TEMPLATES) {
            const templateData = templates.slice(i, i + options.MAX_TEMPLATES);
            const pdfName = templateData.map((item) => item.no).join('_');
            templateData.forEach((item) => (item.pdfName = pdfName));

            options.value = Math.ceil(i / options.MAX_TEMPLATES);
            startLoading(options);

            response = checked
              ? await window.electron.savePDFAndTIFF({ templateData, pathData: configData })
              : await window.electron.savePDF({ templateData, pathData: configData });
          }

          return response;
        };

        let progressOptions = {
          variantType1: {
            value: 0,
            total: Math.ceil(grouped.variantType1.length / 5),
            type: '베이직',
            MAX_TEMPLATES: 5,
            useProgress: true,
          },
          variantType2: {
            value: 0,
            total: Math.ceil(grouped.variantType2.length / 2),
            type: '대용량',
            MAX_TEMPLATES: 2,
            useProgress: true,
          },
          variantType3: {
            value: 0,
            total: Math.ceil(grouped.variantType3.length / 10),
            MAX_TEMPLATES: 10,
            useProgress: true,
          },
        };

        // 각 그룹에 대해 처리
        const entries = Object.entries(grouped);

        let response;
        for (let i = 0; i < entries.length; i++) {
          const [variantType, templates] = entries[i] as [string, ExcelTemplateData[]];

          if (templates.length > 0) {
            if (variantType in progressOptions) {
              response = await processTemplates(
                templates,
                progressOptions[variantType as keyof typeof progressOptions],
              );
            }
          }
        }

        stopLoading();
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
              <TableHead className="w-[450px]">템플릿</TableHead>
              <TableHead>수령자</TableHead>
              <TableHead>인쇄문구</TableHead>
              <TableHead>송장번호</TableHead>
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
