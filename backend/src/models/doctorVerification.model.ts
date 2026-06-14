import { BaseModel } from "./base.model";

export interface DoctorVerification {
  id: string;
  doctorId: string;
  documentType: string;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments?: string | null;
  reviewedById?: string | null;
  reviewedAt?: Date | string | null;
  createdAt?: Date | string;
}

export class DoctorVerificationModelClass extends BaseModel<DoctorVerification> {
  constructor() {
    super("doctorVerifications");
  }
}

export const DoctorVerificationModel = new DoctorVerificationModelClass();
