/**
 * Send an SMS via Twilio.
 * @param to Recipient phone number (e.g. +233240000000).
 * @param body Message content.
 */
export const sendTwilioSMS = async (to: string, body: string): Promise<boolean> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials are not configured in environment variables.");
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
};
