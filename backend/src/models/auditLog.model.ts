import { BaseModel } from "./base.model";

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  ipAddress?: string | null;
  createdAt?: Date | string;
}

export class AuditLogModelClass extends BaseModel<AuditLog> {
  constructor() {
    super("auditLogs");
  }
}

export const AuditLogModel = new AuditLogModelClass();
