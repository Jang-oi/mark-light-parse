import { create } from 'zustand';
// 상태 인터페이스 정의
interface SingleTemplateLogoState {
  logoImageData: Record<string, any>;
  setLogoImageData: (params: Record<string, any>) => void;
}

// Zustand 스토어 생성
export const useSingleTemplateLogoStore = create<SingleTemplateLogoState>((set) => ({
  logoImageData: { name: '', path: '', pdfName: '' },
  setLogoImageData: (params) =>
    set((state) => ({
      logoImageData: { ...state.logoImageData, ...params },
    })),
}));
