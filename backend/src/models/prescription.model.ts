import { BaseModel } from "./base.model";

export interface Prescription {
  id: string;
  consultationId?: string | null;
  patientId: string;
  doctorId: string;
  notes?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class PrescriptionModelClass extends BaseModel<Prescription> {
  constructor() {
    super("prescriptions");
  }
}

export const PrescriptionModel = new PrescriptionModelClass();
