import { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { Route, Routes, useNavigate } from 'react-router-dom';

import MainLayout from '@/pages/MainLayout.tsx';
import MainPage from '@/pages/Main/MainPage.tsx';
import HoldPage from '@/pages/Holding/HoldPage.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    ipcRenderer.on('update-available', () => {
      navigate('/autoUpdate');
    });

    return () => {
      ipcRenderer.removeAllListeners('update-available');
    };
  }, [navigate]);

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
