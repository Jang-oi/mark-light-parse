import { Route, Routes } from 'react-router-dom';

import RootLayout from '@/pages/RootLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import ExcelUploadPage from '@/pages/ExcelUpload/ExcelUploadPage.tsx';
import SavePDFPage from '@/pages/SavePDF/SavePDFPage.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import { useEffect, useState } from 'react';
import MarkAlert from '@/components/common/MarkAlert.tsx';
import LoadingModal from '@/components/common/LoadingModal.tsx';

import { useConfigStore } from '@/store/configStore.ts';
import { useLoadingStore } from '@/store/loadingStore.ts';

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
          <Route path={'/'} element={<MainPage />}></Route>
          <Route path={'/savePDF'} element={<SavePDFPage />}></Route>
          <Route path={'/excelUpload'} element={<ExcelUploadPage />}></Route>
        </Routes>
      </RootLayout>
    </ThemeProvider>
  );
}
