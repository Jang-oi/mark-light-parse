import { Separator } from '@/components/ui/separator.tsx';
import { SidebarNav } from '@/components/common/SidebarNav.tsx';

const sidebarNavItems = [
  {
    title: 'PDF로 저장하기',
    href: '/',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Mark-Light</h2>
        <p className="text-muted-foreground">마크라이트를 위하여</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
