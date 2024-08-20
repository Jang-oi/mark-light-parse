import create from 'zustand';

const INIT_CONFIG_DATA = {
  illustratorInstallPath: '',
  aiFilePath: '',
  pdfSavePath: '',
};
// 상태 인터페이스 정의
interface ConfigState {
  configData: typeof INIT_CONFIG_DATA;
  setConfigData: (params: Partial<Record<string, any>>) => void; // params의 타입을 명확히 정의
}

// Zustand 스토어 생성
export const useConfigStore = create<ConfigState>((set) => ({
  // 초기 상태
  configData: INIT_CONFIG_DATA,
  // 상태를 업데이트하는 함수
  setConfigData: (params) =>
    set((state) => ({
      configData: { ...state.configData, ...params }, // 기존 상태를 유지하면서 새 데이터로 업데이트
    })),
}));
