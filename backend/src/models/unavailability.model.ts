import { BaseModel } from "./base.model";

export interface DoctorUnavailability {
  id: string;
  doctorId: string;
  date: string;       // "YYYY-MM-DD"
  startTime?: string; // "HH:MM" — null means full-day block
  endTime?: string;   // "HH:MM" — null means full-day block
  reason?: string;
}

export class UnavailabilityModelClass extends BaseModel<DoctorUnavailability> {
  constructor() {
    super("doctorUnavailabilities");
  }
}

export const UnavailabilityModel = new UnavailabilityModelClass();
