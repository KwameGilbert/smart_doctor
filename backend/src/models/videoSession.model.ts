import { BaseModel } from "./base.model";

export interface VideoSession {
  id: string;
  consultationId: string;
  channelName: string;
  token?: string;
  status: "INACTIVE" | "ACTIVE" | "ENDED";
  startedAt?: string;
  endedAt?: string;
}

export class VideoSessionModelClass extends BaseModel<VideoSession> {
  constructor() {
    super("videoSessions");
  }
}

export const VideoSessionModel = new VideoSessionModelClass();
