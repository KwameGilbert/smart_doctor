import { BaseModel } from "./base.model";

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export class PrescriptionItemModelClass extends BaseModel<PrescriptionItem> {
  constructor() {
    super("prescriptionItems");
  }
}

export const PrescriptionItemModel = new PrescriptionItemModelClass();
