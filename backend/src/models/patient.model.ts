import { BaseModel } from "./base.model";
import { PatientProfile } from "./user.model";

export class PatientModelClass extends BaseModel<PatientProfile> {
  constructor() {
    super("patients");
  }
}

export const PatientModel = new PatientModelClass();
