import { BaseModel } from "./base.model";

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment?: string | null;
  createdAt?: Date | string;
}

export class ReviewModelClass extends BaseModel<Review> {
  constructor() {
    super("reviews");
  }
}

export const ReviewModel = new ReviewModelClass();
