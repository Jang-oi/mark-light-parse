import { Route, Routes } from 'react-router-dom';

import RootLayout from '@/pages/RootLayout.tsx';
import SetupPage from '@/pages/Setup/SetupPage.tsx';
import SaveBulkExcelPage from '@/pages/PDF/SaveBulk/SaveBulkExcelPage.tsx';
import SaveSinglePage from '@/pages/PDF/SaveSingle/SaveSinglePage.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import { useEffect, useState } from 'react';
import MarkAlert from '@/components/common/MarkAlert.tsx';
import LoadingModal from '@/components/common/LoadingModal.tsx';

import { useConfigStore } from '@/store/configStore.ts';
import { useLoadingStore } from '@/store/loadingStore.ts';
import SaveTiffPage from '@/pages/TIFF/SaveTiffPage.tsx';

export default function App() {
  const { setConfigData } = useConfigStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const checkElectron = async () => {
      if (window.electron && window.ipcRenderer) {
        startLoading();

        const { data } = await window.electron.getConfig();
        setConfigData(data);

        window.ipcRenderer.on('update-available', (_event, response) => {
          console.log(response);
          setIsUpdate(response.isUpdate);
        });
        stopLoading();
      } else {
        setTimeout(checkElectron, 100); // 100ms 후에 다시 확인
      }
    };
    checkElectron();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RootLayout isUpdate={isUpdate}>
        <Toaster />
        <MarkAlert />
        <LoadingModal />
        <Routes>
          <Route path={'/'} element={<SetupPage />} />
          <Route path={'/pdf/save-single'} element={<SaveSinglePage />} />
          <Route path={'/pdf/save-bulk'} element={<SaveBulkExcelPage />} />
          <Route path={'/tiff/save'} element={<SaveTiffPage />} />
        </Routes>
      </RootLayout>
    </ThemeProvider>
  );
}
