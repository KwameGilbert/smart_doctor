// @ts-ignore - Disable import checking if agora-token has no declaration files
import { RtcTokenBuilder, RtcRole } from "agora-token";

/**
 * Generate an Agora RTC token for a video/voice call.
 * 
 * @param channelName Name of the video channel.
 * @param uid Numerical User ID (defaults to 0 for generic authorization).
 * @param expirationTimeInSeconds Duration for which token remains valid.
 */
export const generateAgoraToken = (
  channelName: string,
  uid: number = 0,
  expirationTimeInSeconds: number = 3600
): string => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error("AGORA_APP_ID and AGORA_APP_CERTIFICATE must be configured in environment variables.");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const role = RtcRole.PUBLISHER || 1;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds,
    privilegeExpiredTs
  );
};
