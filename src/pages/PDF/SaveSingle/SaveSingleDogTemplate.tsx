import { CardContent } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Button } from '@/components/ui/button.tsx';
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
import { DOG_TEMPLATES } from '@/utils/constant.ts';
import { Input } from '@/components/ui/input.tsx';
import { useSingleTemplateDataStore } from '@/store/singleTemplateDataStore.ts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { CircleHelp } from 'lucide-react';

const SaveSingleDogTemplate = () => {
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
              <TableHead>템플릿</TableHead>
              <TableHead>수령자</TableHead>
              <TableHead>인쇄문구</TableHead>
              <TableHead>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link">
                        핸드폰번호
                        <CircleHelp className="m-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold">핸드폰번호 TIP</h4>
                        <p className="text-base text-red-500">번호는 010.1234.5678 로 온점 입력 필수</p>
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
                        {DOG_TEMPLATES.map((templateItem) => (
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
                <TableCell className="w-[180px]">
                  <Input value={row.mainName} onChange={(e) => handleChange(row.id, 'mainName', e.target.value)} />
                </TableCell>
                <TableCell className="w-[180px]">
                  <Input
                    value={row.phoneNumber}
                    onChange={(e) => handleChange(row.id, 'phoneNumber', e.target.value)}
                  />
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

export default SaveSingleDogTemplate;
