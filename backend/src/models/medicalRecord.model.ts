import { BaseModel } from "./base.model";

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string | null;
  recordType: string;
  description?: string | null;
  attachmentUrl?: string | null;
  recordDate: Date | string;
  createdAt?: Date | string;
}

export class MedicalRecordModelClass extends BaseModel<MedicalRecord> {
  constructor() {
    super("medicalRecords");
  }
}

export const MedicalRecordModel = new MedicalRecordModelClass();
