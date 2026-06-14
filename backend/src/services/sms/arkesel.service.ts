/**
 * Send an SMS via Arkesel.
 * @param to Recipient phone number (e.g. +233240000000).
 * @param body Message content.
 */
export const sendArkeselSMS = async (to: string, body: string): Promise<boolean> => {
  const apiKey = process.env.ARKESEL_API_KEY;
  const senderId = process.env.ARKESEL_SENDER_ID || "SmartDoc";

  if (!apiKey) {
    throw new Error("Arkesel API Key is not configured in environment variables.");
  }

  const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: senderId,
      message: body,
      recipients: [to]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Arkesel API error: ${JSON.stringify(errorData)}`);
  }
  return true;
};
