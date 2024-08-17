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
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';
import { Label } from '@/components/ui/label.tsx';
import InputField from '@/components/common/InputField.tsx';

interface TemplateData {
  id: number;
  template: string;
  orderName: string;
  userName: string;
  characterCount: string;
  oldOrderName: string;
}
interface PathData {
  illustratorInstallPath: string;
  aiFilePath: string;
  pdfSavePath: string;
}

const MAX_TEMPLATES = 5;
export default function MainPage() {
  const templates = [
    { id: 1, value: '레이일', oldOrderName: '주문일' },
    { id: 2, value: '레이이', oldOrderName: '주문이' },
    { id: 3, value: '레이삼', oldOrderName: '주문삼' },
    { id: 4, value: '레이사', oldOrderName: '주문사' },
    { id: 5, value: '레이오', oldOrderName: '주문오' },
    { id: 6, value: '레이육', oldOrderName: '주문육' },
    { id: 7, value: '레이칠', oldOrderName: '주문칠' },
  ];

  const INIT_TEMPLATE_DATA = {
    id: 1,
    template: '',
    orderName: '',
    userName: '',
    oldOrderName: '',
    characterCount: '3',
  };

  const INIT_PATH_DATA = {
    illustratorInstallPath: '',
    aiFilePath: '',
    pdfSavePath: '',
  };

  const [templateData, setTemplateData] = useState<TemplateData[]>([INIT_TEMPLATE_DATA]);
  const [pathData, setPathData] = useState<PathData>(INIT_PATH_DATA);
  const [isElectronReady, setIsElectronReady] = useState(false);
  const handleAddTemplate = () => {
    if (templateData.length < MAX_TEMPLATES)
      setTemplateData((prevData) => [...prevData, { ...INIT_TEMPLATE_DATA, id: prevData.length + 1 }]);
    else alert(`최대 ${MAX_TEMPLATES}개의 템플릿만 추가할 수 있습니다.`);
  };

  const handleDeleteRow = (id: number) => {
    setTemplateData((prevData) => prevData.filter((row) => row.id !== id));
  };

  const handleChange = (id: number, field: keyof TemplateData, value: string) => {
    if (field === 'orderName' || field === 'userName') {
      // 한글만 포함된 문자열 추출
      const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
      const koreanOnly = value.match(koreanRegex)?.join('') || '';

      if (koreanOnly.length > 3) return;
      value = koreanOnly;
    }

    setTemplateData((prevData) => {
      return prevData.map((row) => {
        if (row.id === id) {
          // 템플릿 필드에 따라 oldOrderName 설정
          const templateItem = templates.find((templateItem) => templateItem.value === row.template);
          const oldOrderName = templateItem ? templateItem.oldOrderName : ''; // templateItem이 undefined일 때 빈 문자열로 설정
          return {
            ...row,
            [field]: value,
            oldOrderName: oldOrderName,
          };
        }
        return row;
      });
    });
  };

  const handlePathChange = (e: any) => {
    const { id, value } = e.target;
    setPathData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSavePDF = async () => {
    const isValid = templateData.every((row) => {
      // 모든 필드가 입력되었는지 확인
      const allFieldsFilled =
        row.template !== '' && row.orderName !== '' && row.userName !== '' && row.characterCount !== '';

      // 사용자 이름의 길이가 선택한 글자 수와 일치하는지 확인
      const correctUserNameLength = row.userName.length === parseInt(row.characterCount);

      return allFieldsFilled && correctUserNameLength;
    });

    if (!isValid) {
      alert('모든 필드를 올바르게 입력해 주세요.\n사용자 이름의 길이는 선택한 글자 수와 일치해야 합니다.');
      return;
    }

    const message = await window.electron.savePDF(templateData, pathData);
    alert(message);
  };

  useEffect(() => {
    const checkElectron = () => {
      if (window.electron) {
        setIsElectronReady(true);
      } else {
        setTimeout(checkElectron, 100); // 100ms 후에 다시 확인
      }
    };

    checkElectron();
  }, []);

  useEffect(() => {
    const getConfigData = async () => {
      if (isElectronReady) {
        try {
          const config = await window.electron.getUserConfig();
          setPathData(config);
        } catch (error) {
          console.error('Failed to get user config:', error);
        }
      }
    };

    getConfigData();
  }, [isElectronReady]);

  return (
    <>
      <Card x-chunk="dashboard-07-chunk-1">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">템플릿</TableHead>
                <TableHead>주문자 이름</TableHead>
                <TableHead>사용자 이름</TableHead>
                <TableHead className="w-[100px]">글자수</TableHead>
                <TableHead>삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templateData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">
                    <Select onValueChange={(value) => handleChange(row.id, 'template', value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Template</SelectLabel>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.value}>
                              {template.value}
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
                    <Input value={row.userName} onChange={(e) => handleChange(row.id, 'userName', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      defaultValue={row.characterCount}
                      onValueChange={(value) => handleChange(row.id, 'characterCount', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="r2" />
                        <Label htmlFor="r2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="r3" />
                        <Label htmlFor="r3">3</Label>
                      </div>
                    </RadioGroup>
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
        <div className="grid gap-6 m-3">
          <InputField
            label="일러스트 실행 경로"
            id="illustratorInstallPath"
            value={pathData.illustratorInstallPath}
            onChange={handlePathChange}
          />
          <InputField label="AI 파일 경로" id="aiFilePath" value={pathData.aiFilePath} onChange={handlePathChange} />
          <InputField label="PDF 저장 경로" id="pdfSavePath" value={pathData.pdfSavePath} onChange={handlePathChange} />
        </div>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={handleSavePDF}>
            PDF 저장
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
