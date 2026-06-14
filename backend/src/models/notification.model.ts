import { BaseModel } from "./base.model";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt?: Date | string;
}

export class NotificationModelClass extends BaseModel<Notification> {
  constructor() {
    super("notifications");
  }
}

export const NotificationModel = new NotificationModelClass();
