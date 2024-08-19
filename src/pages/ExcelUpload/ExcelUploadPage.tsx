import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
// import { useConfigStore } from '@/store/configStore.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';

const ExcelUploadPage = () => {
  // const { pathData, setPathData } = useConfigStore();

  return (
    <>
      <Card>
        <CardContent />
        <div className="grid gap-6 m-3">
          <Label htmlFor="picture">Excel Upload</Label>
          <Input id="picture" type="file" />
          <CardFooter className="justify-center">
            <Button variant="outline">PDF 저장</Button>
          </CardFooter>
        </div>
      </Card>
    </>
  );
};

export default ExcelUploadPage;
