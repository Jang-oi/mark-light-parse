import { CardContent } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Button } from '@/components/ui/button.tsx';
import { CircleHelp } from 'lucide-react';
import { TemplateData } from '@/types/templateTypes.ts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { NAME_TEMPLATES } from '@/utils/constant.ts';
import { Input } from '@/components/ui/input.tsx';
import { useSingleTemplateDataStore } from '@/store/singleTemplateDataStore.ts';

const SaveSingleNameTemplate = () => {
  const { templateData, updateField, deleteTemplate } = useSingleTemplateDataStore();
  const handleDeleteRow = (id: number) => {
    deleteTemplate(id);
  };
  const handleChange = (id: number, field: keyof TemplateData, value: string) => {
    updateField(id, field, value);
  };

  return (
    <>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">템플릿</TableHead>
              <TableHead className="w-1/5">수령자</TableHead>
              <TableHead className="w-1/4">
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
              <TableHead className="w-1/4">송장번호</TableHead>
              <TableHead className="w-1/12">삭제</TableHead>
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
                        {NAME_TEMPLATES.map((templateItem) => (
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
    </>
  );
};

export default SaveSingleNameTemplate;
