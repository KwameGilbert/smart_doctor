import { BaseModel } from "./base.model";
import { DoctorProfile } from "./user.model";

export class DoctorModelClass extends BaseModel<DoctorProfile> {
  constructor() {
    super("doctors");
  }
}

export const DoctorModel = new DoctorModelClass();
