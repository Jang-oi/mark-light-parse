// import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import MainLayout from '@/pages/MainLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import HoldPage from '@/pages/Holding/HoldPage.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';

export default function App() {
  /*  const navigate = useNavigate();

  useEffect(() => {
    window.ipcRenderer.on('update-status', () => {
      navigate('/autoUpdate');
    });

    return () => {
      window.ipcRenderer.removeListener('update-status');
    };
  }, [navigate]);*/

  return (
    <MainLayout>
      <Routes>
        <Route path={'/'} element={<MainPage />}></Route>
        <Route path={'/holding'} element={<HoldPage />}></Route>
        <Route path={'/autoUpdate'} element={<AutoUpdatePage />}></Route>
      </Routes>
    </MainLayout>
  );
}
