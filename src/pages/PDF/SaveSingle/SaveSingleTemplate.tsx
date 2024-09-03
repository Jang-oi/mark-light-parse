import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { TEMPLATES } from '@/utils/constant.ts';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PlusCircle } from 'lucide-react';
import { useConfigStore } from '@/store/configStore.ts';
import { toast } from '@/components/ui/use-toast.ts';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { TemplateData } from '@/types/templateTypes.ts';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { getDateFormat } from '@/utils/helper.ts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';

const SaveSingleTemplate = ({ tabVariantType }: any) => {
  const INIT_TYPE = {
    MAX_TEMPLATES: tabVariantType === 'basic' ? 5 : 2,
    INIT_VARIANT_TYPE: tabVariantType === 'basic' ? '1' : '2',
    VARIANT_TYPE_TEXT: tabVariantType === 'basic' ? '베이직' : '대용량',
  };

  const { MAX_TEMPLATES, INIT_VARIANT_TYPE, VARIANT_TYPE_TEXT } = INIT_TYPE;
  const INIT_TEMPLATE_DATA = {
    id: 1,
    option: '',
    orderName: '',
    mainName: '',
    subName: '',
    characterCount: '3',
    fundingNumber: '',
    variantType: INIT_VARIANT_TYPE,
    layerName: '',
    _mainName: '',
    pdfName: '',
  };
  const [templateData, setTemplateData] = useState<TemplateData[]>([INIT_TEMPLATE_DATA]);
  const [checked, setChecked] = useState(true);
  const handleAsyncTask = useHandleAsyncTask();
  const { configData } = useConfigStore();
  const handleAddTemplate = () => {
    if (templateData.length < MAX_TEMPLATES) {
      setTemplateData((prevData) => [...prevData, { ...INIT_TEMPLATE_DATA, id: prevData.length + 1 }]);
    } else {
      toast({
        variant: 'destructive',
        title: `${VARIANT_TYPE_TEXT}은 최대 ${MAX_TEMPLATES}개의 템플릿만 추가할 수 있습니다.`,
      });
    }
  };

  const handleDeleteRow = (id: number) => {
    setTemplateData((prevData) => prevData.filter((row) => row.id !== id));
  };

  const handleSwitchValue = (checked: boolean) => {
    setChecked(checked);
  };

  const handleChange = (id: number, field: keyof TemplateData, value: string) => {
    setTemplateData((prevData) =>
      prevData.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          updatedRow['characterCount'] = updatedRow.mainName.length.toString();
          let { variantType, option, characterCount } = updatedRow;

          let layerName;
          if (option === '2') {
            // 2 템플릿
            layerName = `${variantType}${option}${characterCount}`;
          } else if (Number(option) < 8) {
            // 1, 3~7 템플릿
            characterCount = Number(characterCount) < 4 ? '3' : '4';
            layerName = `${variantType}${option}${characterCount}`;
          } else {
            // 8~9 템플릿
            layerName = `${variantType}${option}9`;
          }

          updatedRow['layerName'] = layerName;
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleSavePDF = async () => {
    // const updatedTemplateData = templateData.map((item: any) => ({ ...item, pdfName: getDateFormat() }));
    const updatedTemplateData = templateData.map((item: any) => {
      // 9 템플릿은 subName 존재
      if (item.option === '9') {
        const parts = item.mainName.split('/');
        item['_mainName'] = parts[0];
        item['subName'] = parts[1];
      }
      return { ...item, pdfName: getDateFormat() };
    });

    const isValidTemplateData = (data: any) => {
      return data.some((templateItem: any) => {
        const { orderName, mainName, subName = '', option, _mainName = '' } = templateItem;
        const optionNumber = Number(option);
        // 기본적인 빈 값 검증
        if (!orderName || !mainName || !option) {
          toast({ title: '템플릿, 수령자, 인쇄문구는 필수입니다.', variant: 'destructive' });
          return true; // 필수 값이 누락된 경우
        }

        const mainNameLength = mainName.length;
        const _mainNameLength = _mainName.length;
        const subNameLength = subName.length;

        // option에 따른 조건 검증
        if (optionNumber >= 1 && optionNumber <= 7 && mainNameLength > 4) {
          toast({ title: '01~07 템플릿은 인쇄문구가 4글자 이하여야합니다.', variant: 'destructive' });
          return true; // option 1~7이면 mainName이 4글자 이하이어야 함
        }

        if (optionNumber === 8) {
          // 영어 대소문자, 공백, 쉼표, 마침표, 백틱만 허용
          const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
          if (!isEnglishOnly || mainNameLength > 11) {
            toast({ title: '08 템플릿은 인쇄문구가 영문 11글자 이하여야합니다.', variant: 'destructive' });
            return true; // option 8이면 mainName이 영문 11글자 이하이어야 함
          }
        }

        if (optionNumber === 9) {
          if (_mainNameLength > 22 || subNameLength < 1 || subNameLength > 4) {
            toast({
              title: '09 템플릿은 인쇄문구가 22글자 이하여야하고 / 의 뒷 문자가 4글자 이하여야합니다.',
              variant: 'destructive',
            });
            return true; // option 9이면 mainName이 22글자 이하, subName이 4글자 이하이어야 함
          } else {
            templateItem['mainName'] = _mainName;
          }
        }
        // 수령자는 앞에서 4글자를 짤라서 저장해야함
        templateItem['orderName'] = orderName.slice(0, 4);
        return false; // 모든 조건을 만족하면 false
      });
    };

    await handleAsyncTask({
      validationFunc: () => isValidTemplateData(updatedTemplateData),
      alertOptions: {},
      apiFunc: async () => {
        if (checked) {
          const response = await window.electron.savePDFAndTIFF({
            templateData: updatedTemplateData,
            pathData: configData,
          });
          if (response.success) await window.electron.openFolder(configData.tiffSavePath);
          return response;
        } else {
          return window.electron.savePDF({ templateData: updatedTemplateData, pathData: configData });
        }
      },
    });
  };

  return (
    <Card className="w-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>템플릿</TableHead>
              <TableHead>수령자</TableHead>
              <TableHead>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link">
                        인쇄문구
                        <CircleHelp className="m-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold">인쇄문구 TIP</h4>
                        <p className="text-sm">Template 1~7 - 4글자 이하 입력</p>
                        <p className="text-sm">Template 8 - 영문 11글자 이하 입력</p>
                        <p className="text-sm">Template 9 - 22글자 이하 입력 /(슬래쉬) 를 기준으로 두 번째 이름 지정</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead>송장번호</TableHead>
              <TableHead>삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templateData.map((row: TemplateData) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">
                  <Select onValueChange={(value) => handleChange(row.id, 'option', value)}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select a Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Template</SelectLabel>
                        {TEMPLATES.map((templateItem) => (
                          <SelectItem key={templateItem.id} value={templateItem.option}>
                            {templateItem.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input value={row.orderName} onChange={(e) => handleChange(row.id, 'orderName', e.target.value)} />
                </TableCell>
                <TableCell className="w-[300px]">
                  <Input value={row.mainName} onChange={(e) => handleChange(row.id, 'mainName', e.target.value)} />
                </TableCell>
                <TableCell className="w-[180px]">
                  <Input
                    value={row.fundingNumber}
                    onChange={(e) => handleChange(row.id, 'fundingNumber', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => handleDeleteRow(row.id)}>
                    X
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center border-t">
        <Button size="sm" variant="ghost" className="gap-1" onClick={handleAddTemplate}>
          <PlusCircle className="h-3.5 w-3.5" />
          Add Template
        </Button>
      </CardFooter>
      <CardFooter>
        <div className="flex items-center w-80">
          <Switch checked={checked} onCheckedChange={handleSwitchValue} />
          <Label htmlFor="airplane-mode" className="m-4">
            TIFF 자동 저장
          </Label>
        </div>
        <Button className="m-4 w-full" onClick={handleSavePDF}>
          PDF 저장
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SaveSingleTemplate;
