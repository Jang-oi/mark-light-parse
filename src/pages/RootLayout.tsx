import { Separator } from '@/components/ui/separator.tsx';
import SidebarNav from '@/components/common/SidebarNav.tsx';
import React from 'react';
import ModeToggle from '@/components/common/ModeToggle.tsx';
import AutoUpdatePage from '@/pages/AutoUpdate/AutoUpdate.tsx';

const sidebarNavItems = [
  { title: '초기 설정', href: '/' },
  { title: 'PDF 저장 (소량)', href: '/pdf/save-single' },
  { title: 'PDF 저장 (대량)', href: '/pdf/save-bulk' },
  { title: 'TIFF 저장', href: '/tiff/save' },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  isUpdate: boolean;
}

const RootLayout = ({ children, isUpdate }: SettingsLayoutProps) => {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Mark-Light</h2>
          <p className="text-muted-foreground">마크라이트를 위하여</p>
        </div>
        <ModeToggle />
      </div>
      <Separator className="my-6" />
      {isUpdate ? (
        <AutoUpdatePage />
      ) : (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
          <aside className="w-[200px]">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export default RootLayout;
