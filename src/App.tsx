import { Route, Routes } from 'react-router-dom';

import RootLayout from '@/pages/RootLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import HoldPage from '@/pages/Holding/HoldPage.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';
import ExcelUploadPage from '@/pages/ExcelUpload/ExcelUploadPage.tsx';
import SavePDFPage from '@/pages/SavePDF/SavePDFPage.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import { useEffect, useState } from 'react';
import { useConfigStore } from '@/store/configStore.ts';
import MarkAlert from '@/components/common/MarkAlert.tsx';

export default function App() {
  const { setConfigData } = useConfigStore();
  const [isElectronReady, setIsElectronReady] = useState(false);

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
        const { data } = await window.electron.getConfig();
        setConfigData(data);
      }
    };
    getConfigData();
  }, [isElectronReady]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RootLayout>
        <Toaster />
        <MarkAlert />
        <Routes>
          <Route path={'/'} element={<MainPage />}></Route>
          <Route path={'/savePDF'} element={<SavePDFPage />}></Route>
          <Route path={'/excelUpload'} element={<ExcelUploadPage />}></Route>
          <Route path={'/holding'} element={<HoldPage />}></Route>
          <Route path={'/autoUpdate'} element={<AutoUpdatePage />}></Route>
        </Routes>
      </RootLayout>
    </ThemeProvider>
  );
}
