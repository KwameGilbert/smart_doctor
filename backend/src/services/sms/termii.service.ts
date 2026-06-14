/**
 * Send an SMS via Termii.
 * @param to Recipient phone number (e.g. +233240000000).
 * @param body Message content.
 */
export const sendTermiiSMS = async (to: string, body: string): Promise<boolean> => {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "SmartDoc";

  if (!apiKey) {
    throw new Error("Termii API Key is not configured in environment variables.");
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
};
