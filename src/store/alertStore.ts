import { create } from 'zustand';

interface AlertState {
  open: boolean;
  title: string;
  description?: string;
  closeCallBack?: () => void;
  setAlert: (params: { title: string; description?: string; closeCallBack?: () => void }) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  open: false,
  title: '',
  description: '',
  closeCallBack: () => {},
  setAlert: ({ title, description, closeCallBack }) => set({ open: true, title, description, closeCallBack }),
  closeAlert: () => set({ open: false }),
}));
