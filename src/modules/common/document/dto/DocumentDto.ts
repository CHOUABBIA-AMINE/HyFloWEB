export interface DocumentDto {
  id?: number;
  reference?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  uploadDate?: string;
  description?: string;
  documentTypeId?: number;
}
