import { create } from 'zustand';
import { toast } from '@/components/ui/use-toast.ts';

// 초기 상태 데이터
const INIT_TEMPLATE_DATA = {
  id: 1,
  option: '',
  orderName: '',
  mainName: '',
  subName: '',
  characterCount: '',
  fundingNumber: '',
  phoneNumber: '',
  variantType: '',
  layerName: '',
  _mainName: '',
  pdfName: '',
};

// 상태 인터페이스 정의
interface TemplateData {
  id: number;
  option: string;
  orderName: string;
  mainName: string;
  subName: string;
  characterCount: string;
  fundingNumber: string;
  phoneNumber: string;
  variantType: string;
  layerName: string;
  _mainName: string;
  pdfName: string;
}

interface SingleTemplateDataState {
  templateData: TemplateData[];
  initializeTemplateData: (initVariantType: string) => void;
  addTemplate: (maxTemplates: number, variantTypeText: string, initVariantType: string) => void;
  deleteTemplate: (id: number) => void;
  updateField: (id: number, field: keyof TemplateData, value: string) => void;
}

// Zustand 스토어 생성
export const useSingleTemplateDataStore = create<SingleTemplateDataState>((set) => ({
  templateData: [INIT_TEMPLATE_DATA],
  // 초기 템플릿 데이터를 설정하는 함수
  initializeTemplateData: (initVariantType: string) =>
    set(() => ({
      templateData: [{ ...INIT_TEMPLATE_DATA, variantType: initVariantType }],
    })),

  addTemplate: (maxTemplates, variantTypeText, initVariantType) => {
    set((state) => {
      if (state.templateData.length < maxTemplates) {
        const newTemplate = {
          ...INIT_TEMPLATE_DATA,
          id: state.templateData.length + 1,
          variantType: initVariantType,
        };
        return { templateData: [...state.templateData, newTemplate] };
      } else {
        toast({
          variant: 'destructive',
          title: `${variantTypeText}은 최대 ${maxTemplates}개의 템플릿만 추가할 수 있습니다.`,
        });
        return state; // 상태를 변경하지 않음
      }
    });
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templateData: state.templateData.filter((row) => row.id !== id),
    }));
  },

  updateField: (id, field, value) =>
    set((state) => {
      const updatedData = state.templateData.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          if (field === 'mainName') updatedRow.characterCount = value.length.toString();
          // 필요한 로직을 적용하여 layerName을 계산
          updatedRow.layerName = calculateLayerName(updatedRow);
          return updatedRow;
        }
        return row;
      });
      return { templateData: updatedData };
    }),
}));

// layerName 계산을 위한 헬퍼 함수
function calculateLayerName(row: TemplateData): string {
  let { variantType, option, characterCount } = row;

  const isNameSticker = variantType === '1' || variantType === '2';
  const isDogSticker = variantType === 'D';

  if (isNameSticker) {
    if (option === '2') {
      return `${variantType}${option}${characterCount}`;
    } else if (Number(option) < 8) {
      characterCount = Number(characterCount) < 4 ? '3' : '4';
      return `${variantType}${option}${characterCount}`;
    } else {
      return `${variantType}${option}9`;
    }
  } else if (isDogSticker) {
    return `${variantType}${option}${characterCount}`;
  } else {
    return `${variantType}${option}${characterCount}`;
  }
}
