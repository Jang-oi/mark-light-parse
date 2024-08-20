import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import SavePDFTemplate from '@/pages/SavePDF/components/SavePDFTemplate.tsx';

export default function SavePDFPage() {
  return (
    <>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">베이직</TabsTrigger>
          <TabsTrigger value="extra">대용량</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <SavePDFTemplate tabVariantType="basic" />
        </TabsContent>
        <TabsContent value="extra">
          <SavePDFTemplate tabVariantType="extra" />
        </TabsContent>
      </Tabs>
    </>
  );
}
