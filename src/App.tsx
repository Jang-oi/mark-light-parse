import { Route, Routes } from 'react-router-dom';

import RootLayout from '@/pages/RootLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import HoldPage from '@/pages/Holding/HoldPage.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';
import ExcelUploadPage from '@/pages/ExcelUpload/ExcelUploadPage.tsx';
import SavePDFPage from '@/pages/SavePDF/SavePDFPage.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RootLayout>
        <Toaster />
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
