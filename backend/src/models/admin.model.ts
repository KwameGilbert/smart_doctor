import { BaseModel } from "./base.model";

export interface AdminProfile {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AdminModelClass extends BaseModel<AdminProfile> {
  constructor() {
    super("admins");
  }
}

export const AdminModel = new AdminModelClass();
