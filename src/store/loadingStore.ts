import create from 'zustand';

interface ProgressOptions {
  useProgress: boolean;
  value: number;
  total: number;
  onComplete?: () => void;
}

interface LoadingState {
  isLoading: boolean;
  progressOptions: ProgressOptions;
  startLoading: (progressOptions?: Partial<ProgressOptions>) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  progressOptions: { useProgress: false, value: 0, total: 0, onComplete: () => {} },
  startLoading: (progressOptions) =>
    set((state) => ({
      isLoading: true,
      progressOptions: { ...state.progressOptions, ...progressOptions },
    })),
  stopLoading: () => set({ isLoading: false }),
}));
