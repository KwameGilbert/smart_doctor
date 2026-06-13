/**
 * Send an SMS message using Twilio or Termii.
 * @param to Recipient phone number (e.g. +233240000000).
 * @param body Message content.
 */
export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  const provider = process.env.SMS_PROVIDER;

  if (!provider) {
    throw new Error("SMS provider is not configured in environment variables.");
  }

  try {
    if (provider === "TWILIO") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Twilio credentials are not configured in environment.");
      }

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: body
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twilio API error: ${JSON.stringify(errorData)}`);
      }
      return true;
    } else if (provider === "TERMII") {
      const apiKey = process.env.TERMII_API_KEY;
      const senderId = process.env.TERMII_SENDER_ID || "SmartDoc";

      if (!apiKey) {
        throw new Error("Termii API Key is not configured in environment.");
      }

      const response = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to,
          from: senderId,
          sms: body,
          type: "plain",
          channel: "generic",
          api_key: apiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Termii API error: ${JSON.stringify(errorData)}`);
      }
      return true;
    }

    throw new Error(`SMS Provider "${provider}" is unknown or not supported.`);
  } catch (error: any) {
    console.error("❌ Failed to send SMS:", error.message || error);
    return false;
  }
};
