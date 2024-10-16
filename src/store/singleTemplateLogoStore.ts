import { create } from 'zustand';
import { LogoData } from '@/types/templateTypes.ts';

interface SingleTemplateLogoState {
  logoImageData: LogoData[]; // 배열 형태로 변경
  setLogoImageData: (data: LogoData[]) => void; // 전체 배열을 업데이트하는 함수
}

// Zustand 스토어 생성
export const useSingleTemplateLogoStore = create<SingleTemplateLogoState>((set) => ({
  logoImageData: [], // 초기값을 빈 배열로 설정
  setLogoImageData: (data) =>
    set(() => ({
      logoImageData: data,
    })),
}));
