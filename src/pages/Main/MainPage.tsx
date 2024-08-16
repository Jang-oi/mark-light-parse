import HeaderTitle from '@/components/common/HeaderTitle.tsx';
import {Card, CardContent, CardFooter} from '@/components/ui/card.tsx';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import {Input} from '@/components/ui/input.tsx';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group.tsx';
import {Button} from '@/components/ui/button.tsx';
import {PlusCircle} from 'lucide-react';
import {useCallback, useState} from 'react';
import {Separator} from '@/components/ui/separator.tsx';

interface TemplateData {
    id: number;
    template: string;
    orderName: string;
    userName: string;
    characterCount: string;
    oldOrderName: string;
}

const MAX_TEMPLATES = 5;

export default function MainPage() {
    const templates = [
        {value: '레이일', label: '주문일'},
        {value: '레이이', label: '주문이'},
        {value: '레이삼', label: '주문삼'},
        {value: '레이사', label: '주문사'},
        {value: '레이오', label: '주문오'},
        {value: '레이육', label: '주문육'},
        {value: '레이칠', label: '주문칠'},
    ];

    const INIT_DATA = {
        id: 1,
        template: '',
        orderName: '',
        userName: '',
        oldOrderName: '',
        characterCount: '3'
    }

    const [templateData, setTemplateData] = useState<TemplateData[]>([INIT_DATA]);

    const handleAddTemplate = useCallback(() => {
        if (templateData.length < MAX_TEMPLATES) setTemplateData(prevData  => [...prevData, INIT_DATA]);
        else alert(`최대 ${MAX_TEMPLATES}개의 템플릿만 추가할 수 있습니다.`);
    }, [templateData]);

    const handleDeleteRow = useCallback((id: number) => {
        setTemplateData(prevData => prevData.filter(row => row.id !== id));
    }, []);

    const handleChange = useCallback((id: number, field: keyof TemplateData, value: string) => {
        if (field === 'orderName' || field === 'userName') {
            // 한글만 포함된 문자열 추출
            const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
            const koreanOnly = value.match(koreanRegex)?.join('') || '';

            if (koreanOnly.length > 3) return;
            value = koreanOnly;
        }

        setTemplateData(prevData => {
            return prevData.map(row => {
                if (row.id === id) {
                    // 템플릿 필드에 따라 oldOrderName 설정
                    const templateItem = templates.find(templateItem => templateItem.value === row.template);
                    const oldOrderName = templateItem ? templateItem.label : ''; // templateItem이 undefined일 때 빈 문자열로 설정
                    return {
                        ...row,
                        [field]: value,
                        oldOrderName: oldOrderName,
                    };
                }
                return row;
            });
        });
    }, [templates]);

    const handleSavePDF = useCallback(async () => {
        const isValid = templateData.every(row => {
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

        // PDF 저장 로직을 여기에 추가
        const message = await window.electron.savePDF(templateData);
        alert (message);

    }, [templateData]);

    return (
        <>
            <HeaderTitle title={'PDF로 저장하기'} description={'템플릿을 선택 및 추가하여 PDF로 저장하기!!'}/>
            <Card x-chunk="dashboard-07-chunk-1">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">순서</TableHead>
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
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell className="font-semibold">
                                        <Select onValueChange={(value) => handleChange(row.id, 'template', value)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select a Template"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Template</SelectLabel>
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.label} value={template.value}>
                                                            {template.value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.orderName}
                                               onChange={(e) => handleChange(row.id, 'orderName', e.target.value)}/>
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.userName}
                                               onChange={(e) => handleChange(row.id, 'userName', e.target.value)}/>
                                    </TableCell>
                                    <TableCell>
                                        <ToggleGroup
                                            type="single"
                                            defaultValue={row.characterCount}
                                            onValueChange={(value) => handleChange(row.id, 'characterCount', value)}
                                            variant="outline"
                                        >
                                            <ToggleGroupItem value="2">2</ToggleGroupItem>
                                            <ToggleGroupItem value="3">3</ToggleGroupItem>
                                        </ToggleGroup>
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
                <CardFooter className="justify-center border-t p-4">
                    <Button size="sm" variant="ghost" className="gap-1" onClick={handleAddTemplate}>
                        <PlusCircle className="h-3.5 w-3.5"/>
                        Add Template
                    </Button>
                </CardFooter>
                <Separator className="my-6"/>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={handleSavePDF}>
                        PDF 저장
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
