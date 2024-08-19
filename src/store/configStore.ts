import create from 'zustand';

// 초기 상태 정의
const INIT_PATH_DATA = {
  illustratorInstallPath: '',
  aiFilePath: '',
  pdfSavePath: '',
  excelSavePath: '',
};

// 상태 인터페이스 정의
interface ConfigState {
  pathData: typeof INIT_PATH_DATA; // 상태의 데이터 타입을 INIT_PATH_DATA와 동일하게 설정
  setPathData: (newPathData: Partial<typeof INIT_PATH_DATA>) => void; // 상태를 업데이트하는 함수
}

// Zustand 스토어 생성
export const useConfigStore = create<ConfigState>((set) => ({
  // 초기 상태
  pathData: INIT_PATH_DATA,
  // 상태를 업데이트하는 함수
  setPathData: (newPathData) =>
    set((state) => ({
      pathData: { ...state.pathData, ...newPathData }, // 기존 상태를 유지하면서 새 데이터로 업데이트
    })),
}));
