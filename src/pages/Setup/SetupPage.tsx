import { useConfigStore } from '@/store/configStore.ts';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import InputField from '@/components/common/InputField.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useHandleAsyncTask } from '@/utils/handleAsyncTask.ts';

export default function SetupPage() {
  const { configData, setConfigData } = useConfigStore();
  const handleAsyncTask = useHandleAsyncTask();

  const handlePathChange = (e: any) => {
    const { id, value } = e.target;
    setConfigData({ [id]: value });
  };

  const handleSavePath = async () => {
    await handleAsyncTask({ apiFunc: () => window.electron.savePath(configData) });
  };

  return (
    <>
      <Card>
        <CardContent />
        <div className="grid gap-6 m-3">
          <InputField
            label="일러스트 실행 경로"
            id="illustratorInstallPath"
            value={configData.illustratorInstallPath}
            onChange={handlePathChange}
          />
          <InputField
            label="포토샵 실행 경로"
            id="photoshopInstallPath"
            value={configData.photoshopInstallPath}
            onChange={handlePathChange}
          />
          <InputField
            label="PDF 저장 경로"
            id="pdfSavePath"
            value={configData.pdfSavePath}
            onChange={handlePathChange}
          />
          <InputField
            label="PDF 저장 경로"
            id="tiffSavePath"
            value={configData.tiffSavePath}
            onChange={handlePathChange}
          />
          <CardFooter className="justify-center">
            <Button className="w-full" onClick={handleSavePath}>
              경로 저장
            </Button>
          </CardFooter>
        </div>
      </Card>
    </>
  );
}
