import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';

const InputField = ({ label, id, value, onChange }: any) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="text" className="w-full" value={value} onChange={onChange} />
    </div>
  );
};

export default InputField;
