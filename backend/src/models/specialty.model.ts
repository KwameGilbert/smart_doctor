import { BaseModel } from "./base.model";

export interface Specialty {
  id: string;
  name: string;
  description?: string;
}

export class SpecialtyModelClass extends BaseModel<Specialty> {
  constructor() {
    super("specialties");
  }
}

export const SpecialtyModel = new SpecialtyModelClass();
