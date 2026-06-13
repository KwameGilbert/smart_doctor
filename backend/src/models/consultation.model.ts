import { BaseModel } from "./base.model";

export interface Consultation {
  id: string;
  appointmentId: string;
  diagnosis?: string;
  notes?: string;
  recommendations?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ConsultationModelClass extends BaseModel<Consultation> {
  constructor() {
    super("consultations");
  }
}

export const ConsultationModel = new ConsultationModelClass();
