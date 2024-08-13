import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableBody, TableHead, TableCell } from '@/components/ui/table';
import { axiosAPI } from '@/util/axios.ts';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PlusCircle } from 'lucide-react';
export default function App() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card x-chunk="dashboard-07-chunk-1">
        <CardHeader>
          <CardTitle>Stock</CardTitle>
          <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순서</TableHead>
                <TableHead className="w-[200px]">템플릿</TableHead>
                <TableHead>주문자 이름</TableHead>
                <TableHead>주문 번호</TableHead>
                <TableHead className="w-[100px]">글자수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="font-semibold">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                        <SelectItem value="not">X</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Label htmlFor="stock-1" className="sr-only">
                    Stock
                  </Label>
                  <Input id="stock-1" />
                </TableCell>
                <TableCell>
                  <Label htmlFor="price-1" className="sr-only">
                    Price
                  </Label>
                  <Input id="price-1" type="number" defaultValue="99.99" />
                </TableCell>
                <TableCell>
                  <ToggleGroup type="single" defaultValue="3" variant="outline">
                    <ToggleGroupItem value="2" disabled>
                      2
                    </ToggleGroupItem>
                    <ToggleGroupItem value="3">3</ToggleGroupItem>
                  </ToggleGroup>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-center border-t p-4">
          <Button size="sm" variant="ghost" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            Add Variant
          </Button>
        </CardFooter>
      </Card>
      <Card x-chunk="dashboard-07-chunk-2">
        <CardHeader>
          <CardTitle>Product Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="grid gap-3">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category" aria-label="Select category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="subcategory">Subcategory (optional)</Label>
              <Select>
                <SelectTrigger id="subcategory" aria-label="Select subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t-shirts">T-Shirts</SelectItem>
                  <SelectItem value="hoodies">Hoodies</SelectItem>
                  <SelectItem value="sweatshirts">Sweatshirts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm">
          Discard
        </Button>
        <Button size="sm">Save Product</Button>
      </div>
      <Button
        onClick={() => {
          axiosAPI('/savePDF', { key: 'test' });
        }}
      >
        테스트
      </Button>
    </main>
  );
}
