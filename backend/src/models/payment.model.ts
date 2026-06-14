import { BaseModel } from "./base.model";

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED";
  provider: string;
  reference: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class PaymentModelClass extends BaseModel<Payment> {
  constructor() {
    super("payments");
  }
}

export const PaymentModel = new PaymentModelClass();
