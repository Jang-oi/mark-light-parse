import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useConfigStore } from '@/store/configStore.ts';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { ExcelTemplateData } from '@/types/templateTypes.ts';
import { Switch } from '@/components/ui/switch.tsx';
import { useLoadingStore } from '@/store/loadingStore.ts';
import { getVariantType } from '@/utils/constant.ts';
import { useAlertStore } from '@/store/alertStore.ts';
import { formatPhoneNumber } from '@/utils/helper.ts';
import { InputFileUpload } from '@/components/common/InputFileUpload.tsx';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

const SaveBulkExcelTemplate = () => {
  const { configData } = useConfigStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const { setAlert } = useAlertStore();
  const handleAsyncTask = useHandleAsyncTask();
  const [excelFilteredData, setExcelFilteredData] = useState<ExcelTemplateData[]>([]);
  const [checked, setChecked] = useState(true);
  // 숫자 추출을 위한 정규 표현식
  const numberPattern = /_(\d{2})/;
  const handleSwitchValue = (checked: boolean) => {
    setChecked(checked);
  };

  const handleFileReject = () => {
    // 오류 발생 시 상태 초기화
    setExcelFilteredData([]);
  };
  const handleFileSelect = async (acceptedFiles: any) => {
    const ezAdminExcelUploadData = (jsonData: any) => {
      const includedData: any = [];
      const excludedData: any = [];
      const includedKeywords = ['베이직', '대용량', '강아지 스티커'];
      jsonData.forEach((item: any, rowIndex: number) => {
        if (!item['판매처 옵션']) return;
        if (!includedKeywords.some((keyword) => item['상품명'].includes(keyword))) return;

        let isMainName = false;
        // 네임스티커 - 인쇄될 이름, 용량, 디자인
        // 강아지스티커 - 인쇄될 이름, 전화번호, 강아지종
        const [mainNamePart, variantPart, templatePart] = item['판매처 옵션'].split(' / ');
        const templateKind = templatePart.split(': ')[0];

        let mainName = mainNamePart.split(': ')[1];
        let variant = variantPart.split(': ')[1];
        if (variant.includes('베이직')) variant = '베이직';
        else if (variant.includes('대용량')) variant = '대용량';

        const template = templatePart.split(': ')[1];
        const SNumber = item['출력차수']?.replace(/.*?(\d+)차\/(\d+)번.*/, '$1/$2') || '';
        const Tag = item['주문태그'] || '';
        // templateKind 디자인 = 네임스티커
        if (templateKind === '디자인') {
          // 01~09 템플릿인지 확인
          const templateNumber = parseInt(template.substring(0, 2), 10);
          const isTemplate = templateNumber >= 1 && templateNumber <= 8;

          // 1 ~ 7 템플릿은 이름에서 공백 제거 후 길이를 계산하여 2~4글자 이하인 경우만
          if (templateNumber <= 7) {
            const cleanedOption = mainName.replace(/\s+/g, '');
            isMainName = cleanedOption.length >= 2 && cleanedOption.length <= 4;
            mainName = cleanedOption;
          } else if (templateNumber === 8) {
            // 영어 대소문자, 공백, 쉼표, 마침표, 백틱만 허용
            const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
            if (isEnglishOnly && mainName.length <= 11) isMainName = true;
          } else if (templateNumber === 9) {
            // mainName이 22글자 이하, subName이 4글자 이하이어야 함
            // 엑셀에서 subName 난감해서 못하는 중
          }

          if (isMainName && isTemplate) {
            const { INIT_VARIANT_TYPE } = getVariantType(variant);
            let characterCount = mainName.length.toString();

            let layerName;
            if (templateNumber === 2) {
              // 2 템플릿
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
            } else if (templateNumber < 8) {
              // 1, 3~7 템플릿
              if (Number(characterCount) === 2) mainName = mainName.split('').join(' ');
              characterCount = Number(characterCount) < 4 ? '3' : '4';
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
            } else {
              // 8~9 템플릿
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}9`;
            }

            const itemCount = Number(item['주문수량']);
            for (let i = 0; i < itemCount; i++) {
              const newItem = { ...item }; // 원본 객체 복사
              newItem.id = `${rowIndex}_${i}`; // 고유 ID 생성
              newItem.no = item['관리번호'];
              newItem.template = item['판매처 옵션'];
              newItem.SNumber = SNumber;
              newItem.option = `${templateNumber}`;
              newItem.orderName = item['수령자이름'].slice(0, 4);
              newItem.mainName = mainName;
              newItem.fundingNumber = item['송장번호'];
              newItem.characterCount = characterCount;
              newItem.variantType = INIT_VARIANT_TYPE;
              newItem.layerName = layerName;
              newItem.Tag = Tag;

              includedData.push(newItem);
            }
          } else {
            excludedData.push(item);
          }
        } else if (templateKind === '강아지종') {
          // 템플릿은 이름에서 공백 제거 후 길이를 계산하여 2~3글자인 경우만
          const cleanedOption = mainName.replace(/\s+/g, '');
          isMainName = cleanedOption.length >= 2 && cleanedOption.length <= 3;
          mainName = cleanedOption;

          if (isMainName) {
            const { INIT_VARIANT_TYPE } = getVariantType('강아지');
            const templateOption = template.substring(0, 2);
            let characterCount = mainName.length.toString();

            const layerName = `${INIT_VARIANT_TYPE}${templateOption}${characterCount}`;

            const itemCount = Number(item['주문수량']);
            for (let i = 0; i < itemCount; i++) {
              const newItem = { ...item }; // 원본 객체 복사
              newItem.id = `${rowIndex}_${i}`; // 고유 ID 생성
              newItem.no = item['관리번호'];
              newItem.template = item['판매처 옵션'];
              newItem.SNumber = SNumber;
              newItem.option = `${templateOption}`;
              newItem.orderName = item['수령자이름'].slice(0, 4);
              newItem.mainName = mainName;
              newItem.phoneNumber = formatPhoneNumber(variant);
              newItem.fundingNumber = item['송장번호'];
              newItem.characterCount = characterCount;
              newItem.variantType = INIT_VARIANT_TYPE;
              newItem.layerName = layerName;
              newItem.Tag = Tag;

              includedData.push(newItem);
            }
          } else {
            excludedData.push(item);
          }
        }
      });

      return { includedData, excludedData };
    };
    const wadizExcelUploadData = (jsonData: any) => {
      const includedData: any = [];
      const excludedData: any = [];
      jsonData.forEach((item: any, rowIndex: number) => {
        let isMainName = false;

        let mainName = item['옵션조건'];
        const match = item['리워드'].match(numberPattern);
        const option = match ? `${parseInt(match[1], 10)}` : '0';

        const templateNumber = Number(option);
        const isTemplate = templateNumber >= 1 && templateNumber <= 8;

        // 1 ~ 7 템플릿은 이름에서 공백 제거 후 길이를 계산하여 4글자 이하인 경우만
        if (templateNumber <= 7) {
          const cleanedOption = mainName.replace(/\s+/g, '');
          isMainName = cleanedOption.length <= 4;
          mainName = cleanedOption;
        } else if (templateNumber === 8) {
          // 영어 대소문자, 공백, 쉼표, 마침표, 백틱만 허용
          const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
          if (isEnglishOnly && mainName.length <= 11) isMainName = true;
        } else if (templateNumber === 9) {
          // mainName이 22글자 이하, subName이 4글자 이하이어야 함
          // 엑셀에서 subName 난감해서 못하는 중
        }

        if (isMainName && isTemplate) {
          let variant = '베이직';
          if (item['리워드'].includes('베이직')) variant = '베이직';
          else if (item['리워드'].includes('대용량')) variant = '대용량';

          const { INIT_VARIANT_TYPE } = getVariantType(variant);

          let characterCount = mainName.length.toString();
          let layerName;
          if (templateNumber === 2) {
            // 2 템플릿
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
          } else if (templateNumber < 8) {
            // 1, 3~7 템플릿
            if (Number(characterCount) === 2) mainName = mainName.split('').join(' ');
            characterCount = Number(characterCount) < 4 ? '3' : '4';
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
          } else {
            // 8~9 템플릿
            layerName = `${INIT_VARIANT_TYPE}${templateNumber}9`;
          }

          const itemCount = Number(item['수량']);
          for (let i = 0; i < itemCount; i++) {
            const newItem = { ...item }; // 원본 객체 복사
            newItem.id = `${rowIndex}_${i}`; // 고유 ID 생성;
            newItem.no = item['No.'];
            newItem.template = item['리워드'];
            newItem.option = `${templateNumber}`;
            newItem.orderName = item['받는사람 성명'].slice(0, 4);
            newItem.mainName = mainName;
            newItem.fundingNumber = item['펀딩번호'];
            newItem.characterCount = characterCount;
            newItem.variantType = INIT_VARIANT_TYPE;
            newItem.layerName = layerName;

            includedData.push(newItem);
          }
        } else {
          excludedData.push(item);
        }
      });
      return { includedData, excludedData };
    };
    const emergencyExcelUploadData = (jsonData: any) => {
      const includedData: any = [];
      const excludedData: any = [];
      const includedKeywords = ['베이직', '대용량', '강아지 스티커'];
      jsonData.forEach((item: any, rowIndex: number) => {
        if (!item['판매처 옵션']) return;
        if (!includedKeywords.some((keyword) => item['상품명'].includes(keyword))) return;

        let isMainName = false;
        // 네임스티커 - 인쇄될 이름, 용량, 디자인
        // 강아지스티커 - 인쇄될 이름, 전화번호, 강아지종
        const [mainNamePart, _variantPart, templatePart] = item['판매처 옵션'].split(' / ');
        const templateKind = templatePart.split(': ')[0];

        let mainName = mainNamePart.split(': ')[1];
        const variant = '긴급';
        const template = templatePart.split(': ')[1];
        const SNumber = item['출력차수']?.replace(/.*?(\d+)차\/(\d+)번.*/, '$1/$2') || '';
        const Tag = item['주문태그'] || '';

        // templateKind 디자인 = 네임스티커
        if (templateKind === '디자인') {
          // 01~09 템플릿인지 확인
          const templateNumber = parseInt(template.substring(0, 2), 10);
          const isTemplate = templateNumber >= 1 && templateNumber <= 8;

          // 1 ~ 7 템플릿은 이름에서 공백 제거 후 길이를 계산하여 2~4글자 이하인 경우만
          if (templateNumber <= 7) {
            const cleanedOption = mainName.replace(/\s+/g, '');
            isMainName = cleanedOption.length >= 2 && cleanedOption.length <= 4;
            mainName = cleanedOption;
          } else if (templateNumber === 8) {
            // 영어 대소문자, 공백, 쉼표, 마침표, 백틱만 허용
            const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
            if (isEnglishOnly && mainName.length <= 11) isMainName = true;
          } else if (templateNumber === 9) {
            // mainName이 22글자 이하, subName이 4글자 이하이어야 함
            // 엑셀에서 subName 난감해서 못하는 중
          }

          if (isMainName && isTemplate) {
            const { INIT_VARIANT_TYPE } = getVariantType(variant);
            let characterCount = mainName.length.toString();

            let layerName;
            if (templateNumber === 2) {
              // 2 템플릿
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
            } else if (templateNumber < 8) {
              // 1, 3~7 템플릿
              if (Number(characterCount) === 2) mainName = mainName.split('').join(' ');
              characterCount = Number(characterCount) < 4 ? '3' : '4';
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}${characterCount}`;
            } else {
              // 8~9 템플릿
              layerName = `${INIT_VARIANT_TYPE}${templateNumber}9`;
            }

            const itemCount = Number(item['주문수량']);
            for (let i = 0; i < itemCount; i++) {
              const newItem = { ...item }; // 원본 객체 복사
              newItem.id = `${rowIndex}_${i}`; // 고유 ID 생성;
              newItem.no = item['관리번호'];
              newItem.template = item['판매처 옵션'];
              newItem.SNumber = SNumber;
              newItem.option = `${templateNumber}`;
              newItem.orderName = item['수령자이름'].slice(0, 4);
              newItem.mainName = mainName;
              newItem.fundingNumber = item['송장번호'];
              newItem.characterCount = characterCount;
              newItem.variantType = INIT_VARIANT_TYPE;
              newItem.layerName = layerName;
              newItem.Tag = Tag;

              includedData.push(newItem);
            }
          } else {
            excludedData.push(item);
          }
        }
      });

      return { includedData, excludedData };
    };
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', bookVBA: true });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      let resultData, excludedData;
      if (file.name.includes('확장주문')) {
        ({ includedData: resultData, excludedData } = ezAdminExcelUploadData(jsonData));
      } else if (file.name.includes('긴급')) {
        ({ includedData: resultData, excludedData } = emergencyExcelUploadData(jsonData));
      } else {
        ({ includedData: resultData, excludedData } = wadizExcelUploadData(jsonData));
      }

      const excludedDataLength = excludedData.length;
      if (excludedDataLength) {
        await window.electron.saveExcludedData({ filePath: file.path, fileName: file.name, excludedData });
      }
      setExcelFilteredData(resultData);
      setAlert({ title: 'Excel Upload 완료', description: `Excel 제외 건은 총 ${excludedDataLength}건 입니다.` });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSavePDFExcel = async () => {
    const excelFilteredDataLength = excelFilteredData.length;

    await handleAsyncTask({
      validationFunc: () => excelFilteredDataLength === 0,
      validationMessage: 'Excel 파일이 정상적으로 업로드되어야 합니다.',
      alertOptions: {},
      useLoading: false,
      apiFunc: async () => {
        // 그룹화된 결과를 저장할 객체
        const grouped: Record<string, ExcelTemplateData[]> = {
          variantType1: [],
          variantType2: [],
          variantTypeD: [],
          variantTypeE: [],
        };
        // 배열을 순회하면서 각 객체를 해당 variantType에 맞는 배열에 넣음
        excelFilteredData.forEach((item: ExcelTemplateData) => {
          if (!grouped[`variantType${item.variantType}`])
            throw `No ${item.no} 가 정상적인 데이터가 아닙니다. Excel 에서 제거 후 확인해주세요.`;
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
          variantTypeD: {
            value: 0,
            total: Math.ceil(grouped.variantTypeD.length / 10),
            type: '강아지',
            MAX_TEMPLATES: 10,
            useProgress: true,
          },
          variantTypeE: {
            value: 0,
            total: Math.ceil(grouped.variantTypeE.length / 2),
            type: '긴급',
            MAX_TEMPLATES: 2,
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
        <Label htmlFor="excel-upload">Excel Upload</Label>
        <InputFileUpload
          onFileSelect={handleFileSelect}
          onFileReject={handleFileReject}
          acceptedFileTypes={[
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ]}
          label="Excel (xslx, xls) 파일을 업로드해주세요."
        />
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
        <ScrollArea className="h-80 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead className="w-[500px]">템플릿</TableHead>
                <TableHead>수령자</TableHead>
                <TableHead>인쇄문구</TableHead>
                <TableHead>핸드폰번호</TableHead>
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
                    <Input value={filteredItem.phoneNumber} disabled />
                  </TableCell>
                  <TableCell>
                    <Input value={filteredItem.fundingNumber} disabled />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default SaveBulkExcelTemplate;
