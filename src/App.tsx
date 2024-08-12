import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function App() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="mt-auto p-3">
          <Card x-chunk="dashboard-02-chunk-0">
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>AI FILE UPLOAD</CardTitle>
              <CardDescription>사용할 AI 템플릿이 저장된 파일을 업로드해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                UPLOAD
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">하하</main>
      </div>
    </div>
  );
}
