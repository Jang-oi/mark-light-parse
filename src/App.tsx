import MainLayout from '@/pages/MainLayout.tsx';
import { Route, Routes } from 'react-router-dom';
import MainPage from '@/pages/Main/MainPage.tsx';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path={'/'} element={<MainPage />}></Route>
      </Routes>
    </MainLayout>
  );
}
