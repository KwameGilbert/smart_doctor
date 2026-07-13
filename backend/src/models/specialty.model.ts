import { BaseModel } from "./base.model";

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  bg?: string | null;
}

export class SpecialtyModelClass extends BaseModel<Specialty> {
  constructor() {
    super("specialties");
  }
}

export const SpecialtyModel = new SpecialtyModelClass();
