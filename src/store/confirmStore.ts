import { create } from 'zustand';

interface ConfirmState {
  open: boolean;
  title: string;
  description?: string;
  cancelText: string;
  proceedText: string;
  handleProceed: () => void;
  setConfirm: (params: {
    title: string;
    description?: string;
    cancelText?: string;
    proceedText?: string;
    handleProceed?: () => void;
  }) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  title: '',
  description: '',
  cancelText: '취소', // 기본값
  proceedText: '진행', // 기본값
  handleProceed: () => {}, // 기본값
  setConfirm: ({
    title,
    description = '', // 기본값 설정
    cancelText = '취소', // 기본값 설정
    proceedText = '진행', // 기본값 설정
    handleProceed = () => {}, // 기본값 설정
  }) =>
    set({
      open: true,
      title,
      description,
      cancelText,
      proceedText,
      handleProceed,
    }),
  closeConfirm: () => set({ open: false }),
}));
