import { BaseModel } from "./base.model";

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedById: string;
  createdAt?: Date | string;
}

export class DocumentModelClass extends BaseModel<Document> {
  constructor() {
    super("documents");
  }
}

export const DocumentModel = new DocumentModelClass();
