import { useState } from 'react';
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
    characterCount: '3',
    fundingNumber: '',
    variantType: INIT_VARIANT_TYPE,
    layerName: '',
    _orderName: '',
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
          let updatedRow = { ...row, [field]: value };
          // 한글만 포함된 문자열 추출
          if (field === 'orderName' || field === 'mainName') {
            const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
            const koreanOnly = value.match(koreanRegex)?.join('') || '';

            if (koreanOnly.length > 3) return row;
            updatedRow[field] = koreanOnly;
            updatedRow['characterCount'] = updatedRow.mainName.length.toString();
          }
          const { variantType, option, characterCount } = updatedRow;
          let commonNameValue = `${variantType}${option}${characterCount}`;
          if (option !== '2') commonNameValue = `${variantType}${option}3`;

          updatedRow['layerName'] = commonNameValue;
          updatedRow['_orderName'] = `N${commonNameValue}`;
          updatedRow['_mainName'] = commonNameValue;

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleSavePDF = async () => {
    const updatedTemplateData = templateData.map((item: any) => ({ ...item, pdfName: getDateFormat() }));

    const isValidTemplateData = (data: any) => {
      return data.some((templateItem: any) => {
        return templateItem.orderName === '' || templateItem.mainName === '' || templateItem.option === '';
      });
    };

    await handleAsyncTask({
      validationFunc: () => isValidTemplateData(updatedTemplateData),
      validationMessage: '템플릿, 수령자, 인쇄문구은 필수 입니다.',
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
              <TableHead>인쇄문구</TableHead>
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
                <TableCell>
                  <Input value={row.mainName} onChange={(e) => handleChange(row.id, 'mainName', e.target.value)} />
                </TableCell>
                <TableCell>
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
