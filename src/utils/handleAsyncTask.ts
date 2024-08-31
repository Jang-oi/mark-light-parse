import { useLoadingStore } from '@/store/loadingStore.ts';
import { useAlertStore } from '@/store/alertStore.ts';
import { toast } from '@/components/ui/use-toast.ts';

export function useHandleAsyncTask() {
  const { startLoading, stopLoading } = useLoadingStore();
  const { setAlert } = useAlertStore();

  return async ({
    validationFunc,
    validationMessage,
    apiFunc,
    alertOptions,
    useLoading = true,
  }: {
    validationFunc?: () => boolean;
    validationMessage?: string;
    apiFunc: () => Promise<any>;
    alertOptions?: {
      title?: string;
      description?: string;
      closeCallBack?: () => Promise<any>;
    };
    useLoading?: boolean;
  }) => {
    if (validationFunc && validationFunc()) {
      toast({
        variant: 'destructive',
        title: '유효성 검사 실패',
        description: validationMessage || '입력 값을 확인해주세요.',
      });
      return;
    }

    try {
      if (useLoading) startLoading();
      const response = await apiFunc();

      if (!response.success) {
        toast({ variant: 'destructive', title: response.message });
      } else {
        if (alertOptions) {
          setAlert({ title: response.message, ...alertOptions });
        } else {
          toast({ title: response.message });
        }
      }
    } catch (error) {
      console.error('작업 중 오류 발생:', error);
      setAlert({ title: '작업 중 오류가 발생했습니다.', description: '문제가 계속되면 관리자에게 문의하세요.' });
    } finally {
      if (useLoading) stopLoading();
    }
  };
}
