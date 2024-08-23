import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

const AutoUpdatePage = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleProgress = (_event: any, response: any) => {
      const { percent } = response;
      setProgress(Math.round(percent));
    };
    window.ipcRenderer.on('download-progress', handleProgress);

    return () => {
      window.ipcRenderer.removeAllListeners('download-progress');
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">프로그램 업데이트중입니다.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">업데이트 후 자동으로 재실행 됩니다.</p>
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2">{progress}%</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoUpdatePage;
