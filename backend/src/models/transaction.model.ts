import { BaseModel } from "./base.model";

export interface Transaction {
  id: string;
  paymentId?: string | null;
  userId: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "REFUND" | "PAYOUT";
  description: string;
  createdAt?: Date | string;
}

export class TransactionModelClass extends BaseModel<Transaction> {
  constructor() {
    super("transactions");
  }
}

export const TransactionModel = new TransactionModelClass();
