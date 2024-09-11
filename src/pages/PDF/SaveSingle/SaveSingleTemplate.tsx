import { useEffect, useState } from 'react';
import { Card, CardFooter } from '@/components/ui/card.tsx';
import { getVariantType } from '@/utils/constant.ts';
import { Button } from '@/components/ui/button.tsx';
import { PlusCircle } from 'lucide-react';
import { useConfigStore } from '@/store/configStore.ts';
import { toast } from '@/components/ui/use-toast.ts';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { getDateFormat } from '@/utils/helper.ts';
import { useSingleTemplateDataStore } from '@/store/singleTemplateDataStore.ts';
import SaveSingleNameTemplate from '@/pages/PDF/SaveSingle/SaveSingleNameTemplate.tsx';
import SaveSingleDogTemplate from '@/pages/PDF/SaveSingle/SaveSingleDogTemplate.tsx';
import { TemplateData } from '@/types/templateTypes.ts';
import SaveSingleLogoTemplate from '@/pages/PDF/SaveSingle/SaveSingleLogoTemplate.tsx';

type TemplateType = 'basic' | 'extra' | 'dog' | 'logo';
const templateComponents: Record<TemplateType, any> = {
  basic: SaveSingleNameTemplate,
  extra: SaveSingleNameTemplate,
  dog: SaveSingleDogTemplate,
  logo: SaveSingleLogoTemplate,
};
const SaveSingleTemplate = ({ tabVariantType }: { tabVariantType: TemplateType }) => {
  const { MAX_TEMPLATES, INIT_VARIANT_TYPE, VARIANT_TYPE_TEXT } = getVariantType(tabVariantType);

  const isNameSticker: boolean = tabVariantType === 'basic' || tabVariantType === 'extra';
  const isDogSticker: boolean = tabVariantType === 'dog';
  const isLogoSticker: boolean = tabVariantType === 'logo';

  const { templateData, addTemplate, initializeTemplateData } = useSingleTemplateDataStore();
  const [checked, setChecked] = useState(true);
  const handleAsyncTask = useHandleAsyncTask();
  const { configData } = useConfigStore();
  const TemplateComponent = templateComponents[tabVariantType];

  const handleAddTemplate = () => {
    addTemplate(MAX_TEMPLATES, VARIANT_TYPE_TEXT, INIT_VARIANT_TYPE);
  };

  const handleSwitchValue = (checked: boolean) => {
    setChecked(checked);
  };

  const validateNameSticker = (data: TemplateData[]) => {
    return data.some((item) => {
      const { orderName, mainName, subName = '', option, _mainName = '' } = item;
      const optionNumber = Number(option);

      if (!orderName || !mainName || !option) {
        toast({ title: '템플릿, 수령자, 인쇄문구는 필수입니다.', variant: 'destructive' });
        return true;
      }

      const mainNameLength = mainName.length;
      const _mainNameLength = _mainName.length;
      const subNameLength = subName.length;

      if (optionNumber >= 1 && optionNumber <= 7 && mainNameLength > 4) {
        toast({ title: '01~07 템플릿은 인쇄문구가 4글자 이하여야합니다.', variant: 'destructive' });
        return true;
      }

      if (optionNumber === 8) {
        const isEnglishOnly = /^[a-zA-Z ,.`]+$/.test(mainName);
        if (!isEnglishOnly || mainNameLength > 11) {
          toast({ title: '08 템플릿은 인쇄문구가 영문 11글자 이하여야합니다.', variant: 'destructive' });
          return true;
        }
      }

      if (optionNumber === 9) {
        if (_mainNameLength > 22 || subNameLength < 1 || subNameLength > 4) {
          toast({
            title: '09 템플릿은 인쇄문구가 22글자 이하여야하고 / 의 뒷 문자가 4글자 이하여야합니다.',
            variant: 'destructive',
          });
          return true;
        } else {
          item.mainName = _mainName;
        }
      }

      item.orderName = orderName.slice(0, 4);
      return false;
    });
  };

  const phoneNumberRegex = /^010[.]?\d{4}[.]?\d{4}$/;

  const validateDogSticker = (data: TemplateData[]) => {
    return data.some((item) => {
      const { orderName, mainName, option, phoneNumber } = item;

      if (!orderName || !mainName || !option || !phoneNumber) {
        toast({ title: '템플릿, 수령자, 인쇄문구, 핸드폰번호는 필수입니다.', variant: 'destructive' });
        return true;
      }

      if (mainName.length < 2 || mainName.length > 3) {
        toast({
          title: '강아지 템플릿은 인쇄문구가 2~3글자여야 합니다.',
          variant: 'destructive',
        });
        return true;
      }

      // Validate phone number format
      if (!phoneNumberRegex.test(phoneNumber)) {
        toast({
          title: '핸드폰 번호는 올바른 형식이어야 합니다.',
          description: '(예: 010.0000.0000)',
          variant: 'destructive',
        });
        return true;
      }

      item.orderName = orderName.slice(0, 4);
      return false;
    });
  };

  const handleSavePDF = async () => {
    const updatedTemplateData = templateData.map((item: any) => {
      // 9 템플릿은 subName 존재
      if (item.option === '9') {
        const parts = item.mainName.split('/');
        item['_mainName'] = parts[0];
        item['subName'] = parts[1];
      }
      return { ...item, pdfName: getDateFormat() };
    });

    let isValidTemplateData: (data: TemplateData[]) => boolean;

    if (isNameSticker) {
      isValidTemplateData = validateNameSticker;
    } else if (isDogSticker) {
      isValidTemplateData = validateDogSticker;
    } else {
      toast({ title: '지원하지 않는 템플릿 유형입니다.', variant: 'destructive' });
      return;
    }

    await handleAsyncTask({
      validationFunc: () => isValidTemplateData(updatedTemplateData),
      alertOptions: {},
      apiFunc: async () => {
        if (checked) {
          return window.electron.savePDFAndTIFF({ templateData: updatedTemplateData, pathData: configData });
        } else {
          return window.electron.savePDF({ templateData: updatedTemplateData, pathData: configData });
        }
      },
    });
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 초기 상태를 설정합니다.
    initializeTemplateData(INIT_VARIANT_TYPE);
  }, [INIT_VARIANT_TYPE, initializeTemplateData]);

  return (
    <Card className="w-full">
      <TemplateComponent />
      {!isLogoSticker && (
        <CardFooter className="justify-center border-t">
          <Button size="sm" variant="ghost" className="gap-1" onClick={handleAddTemplate}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Template
          </Button>
        </CardFooter>
      )}
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
