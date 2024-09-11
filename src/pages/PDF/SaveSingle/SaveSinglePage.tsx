import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import SaveSingleTemplate from '@/pages/PDF/SaveSingle/SaveSingleTemplate.tsx';

export default function SaveSinglePage() {
  return (
    <>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">베이직</TabsTrigger>
          <TabsTrigger value="extra">대용량</TabsTrigger>
          <TabsTrigger value="dog">강아지</TabsTrigger>
          <TabsTrigger value="logo">로고</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <SaveSingleTemplate tabVariantType="basic" />
        </TabsContent>
        <TabsContent value="extra">
          <SaveSingleTemplate tabVariantType="extra" />
        </TabsContent>
        <TabsContent value="dog">
          <SaveSingleTemplate tabVariantType="dog" />
        </TabsContent>
        <TabsContent value="logo">
          <SaveSingleTemplate tabVariantType="logo" />
        </TabsContent>
      </Tabs>
    </>
  );
}
