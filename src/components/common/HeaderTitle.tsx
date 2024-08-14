import { Separator } from '@/components/ui/separator.tsx';

const HeaderTitle = ({ title, description }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />
    </div>
  );
};

export default HeaderTitle;
