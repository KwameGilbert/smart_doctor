import { sendTwilioSMS } from "./sms/twilio.service";
import { sendTermiiSMS } from "./sms/termii.service";
import { sendArkeselSMS } from "./sms/arkesel.service";

/**
 * Send an SMS message using Twilio, Termii, or Arkesel.
 * Dynamically switches based on the SMS_PROVIDER environment variable.
 * 
 * @param to Recipient phone number (e.g. +233240000000).
 * @param body Message content.
 */
export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  const provider = process.env.SMS_PROVIDER;

  if (!provider) {
    console.warn("[SMS Service] SMS provider is not configured. Message not sent.");
    return false;
  }

  try {
    switch (provider.toUpperCase()) {
      case "TWILIO":
        return await sendTwilioSMS(to, body);
      case "TERMII":
        return await sendTermiiSMS(to, body);
      case "ARKESEL":
        return await sendArkeselSMS(to, body);
      default:
        throw new Error(`SMS Provider "${provider}" is unknown or not supported.`);
    }
  } catch (error: any) {
    console.error(`❌ [SMS Service] Failed to send SMS via ${provider}:`, error.message || error);
    return false;
  }
};
