import { BaseModel } from "./base.model";

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  status?: "SENT" | "DELIVERED" | "READ";
  deliveredAt?: string;
  readAt?: string;
  createdAt?: string;
}

export class MessageModelClass extends BaseModel<Message> {
  constructor() {
    super("messages");
  }
}

export const MessageModel = new MessageModelClass();
