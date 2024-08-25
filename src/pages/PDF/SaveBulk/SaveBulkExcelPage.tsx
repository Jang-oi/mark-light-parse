import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import SaveBulkExcelTemplate from '@/pages/PDF/SaveBulk/SaveBulkExcelTemplate.tsx';

const SaveBulkExcelPage = () => {
  return (
    <>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">베이직</TabsTrigger>
          <TabsTrigger value="extra">대용량</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <SaveBulkExcelTemplate tabVariantType="basic" />
        </TabsContent>
        <TabsContent value="extra">
          <SaveBulkExcelTemplate tabVariantType="extra" />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default SaveBulkExcelPage;
