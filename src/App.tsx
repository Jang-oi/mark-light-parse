import { Route, Routes } from 'react-router-dom';

import RootLayout from '@/pages/RootLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import HoldPage from '@/pages/Holding/HoldPage.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';
import ExcelUploadPage from '@/pages/ExcelUpload/ExcelUploadPage.tsx';
import SavePDFPage from '@/pages/SavePDF/SavePDFPage.tsx';

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path={'/'} element={<MainPage />}></Route>
        <Route path={'/savePDF'} element={<SavePDFPage />}></Route>
        <Route path={'/excelUpload'} element={<ExcelUploadPage />}></Route>
        <Route path={'/holding'} element={<HoldPage />}></Route>
        <Route path={'/autoUpdate'} element={<AutoUpdatePage />}></Route>
      </Routes>
    </RootLayout>
  );
}
