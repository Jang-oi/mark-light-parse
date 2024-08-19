import { useConfigStore } from '@/store/configStore.ts';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import InputField from '@/components/common/InputField.tsx';
import { Button } from '@/components/ui/button.tsx';

export default function MainPage() {
  const { pathData, setPathData } = useConfigStore();
  const [isElectronReady, setIsElectronReady] = useState(false);

  const handlePathChange = (e: any) => {
    const { id, value } = e.target;
    setPathData({ [id]: value });
  };
  const handleSavePath = async () => {
    const message = await window.electron.savePath(pathData);
    alert(message);
  };

  useEffect(() => {
    const checkElectron = () => {
      if (window.electron) {
        setIsElectronReady(true);
      } else {
        setTimeout(checkElectron, 100); // 100ms 후에 다시 확인
      }
    };
    checkElectron();
  }, []);

  useEffect(() => {
    const getConfigData = async () => {
      if (isElectronReady) {
        try {
          const config = await window.electron.getUserConfig();
          setPathData(config);
        } catch (error) {
          console.error('Failed to get user config:', error);
        }
      }
    };

    getConfigData();
  }, [isElectronReady]);

  return (
    <>
      <Card>
        <CardContent />
        <div className="grid gap-6 m-3">
          <InputField
            label="일러스트 실행 경로"
            id="illustratorInstallPath"
            value={pathData.illustratorInstallPath}
            onChange={handlePathChange}
          />
          <InputField label="AI 파일 경로" id="aiFilePath" value={pathData.aiFilePath} onChange={handlePathChange} />
          <InputField label="PDF 저장 경로" id="pdfSavePath" value={pathData.pdfSavePath} onChange={handlePathChange} />
          <InputField
            label="Excel Upload 저장 경로"
            id="excelSavePath"
            value={pathData.excelSavePath}
            onChange={handlePathChange}
          />
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={handleSavePath}>
              경로 저장
            </Button>
          </CardFooter>
        </div>
      </Card>
    </>
  );
}
