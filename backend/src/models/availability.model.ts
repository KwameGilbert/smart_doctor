import { BaseModel } from "./base.model";

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  isAvailable: boolean;
}

export class AvailabilityModelClass extends BaseModel<DoctorAvailability> {
  constructor() {
    super("doctorAvailabilities");
  }
}

export const AvailabilityModel = new AvailabilityModelClass();
