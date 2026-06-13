import { BaseModel } from "./base.model";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class AppointmentModelClass extends BaseModel<Appointment> {
  constructor() {
    super("appointments");
  }
}

export const AppointmentModel = new AppointmentModelClass();
