import { useLoadingStore } from '@/store/loadingStore.ts';
import { Progress } from '@/components/ui/progress.tsx';
import { useEffect } from 'react';

const LoadingModal = () => {
  const { isLoading, progressOptions } = useLoadingStore();
  const { useProgress, value, total, type, onComplete } = progressOptions;

  useEffect(() => {
    if (value === 100 || (total && value === total)) {
      if (onComplete) onComplete();
    }
  }, [value, total, onComplete]);

  if (!isLoading) return null;

  const progressValue = total ? (value / total) * 100 : value;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-bold text-primary">잠시만 기다려주세요.</h2>
        {type && <p>{type} 문서를 작업중입니다...</p>}
        {useProgress && (
          <>
            <Progress value={progressValue} className="w-full h-2" />
            <p className="text-lg font-medium text-muted-foreground">
              {total ? `${value}/${total}` : `${progressValue.toFixed(0)}%`}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
