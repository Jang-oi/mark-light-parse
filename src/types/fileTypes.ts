export interface fileTypeData {
  id: number;
  name: string;
  path: string;
  type: string;
}

export interface FileWithDimensions extends File {
  width?: number;
  height?: number;
  path?: string;
}
