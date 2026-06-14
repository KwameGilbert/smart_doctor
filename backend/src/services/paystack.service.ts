import https from "https";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * Helper to determine if we should run in Mock mode.
 * Mock mode is active if the key is not set, or contains "mock".
 */
const isMockMode = (): boolean => {
  return !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.includes("mock");
};

/**
 * Initialize a Paystack transaction.
 * @param email Customer's email address.
 * @param amount Amount to pay in base currency (e.g. GHS, NGN, USD).
 * @param reference Unique transaction reference.
 */
export const initializeTransaction = async (
  email: string,
  amount: number,
  reference: string
): Promise<{ authorization_url: string; reference: string }> => {
  if (isMockMode() || reference.startsWith("MOCK-")) {
    return {
      authorization_url: `https://checkout.paystack.com/mock-checkout?ref=${reference}`,
      reference
    };
  }

  return new Promise((resolve, reject) => {
    // Paystack amount must be in subunit (kobo / pesewas)
    const data = JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      reference
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (parsed.status && parsed.data && parsed.data.authorization_url) {
            resolve({
              authorization_url: parsed.data.authorization_url,
              reference: parsed.data.reference
            });
          } else {
            reject(new Error(parsed.message || "Failed to initialize Paystack transaction."));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Verify a Paystack transaction by its reference.
 * @param reference Unique reference of the transaction.
 */
export const verifyTransaction = async (
  reference: string
): Promise<{ status: boolean; gatewayResponse: string; amount: number }> => {
  if (isMockMode() || reference.startsWith("MOCK-")) {
    // Return mock verification response
    if (reference.includes("FAIL")) {
      return {
        status: false,
        gatewayResponse: "Transaction failed (Simulated)",
        amount: 0
      };
    }
    return {
      status: true,
      gatewayResponse: "Approved (Simulated)",
      amount: 0 // Will keep amount matching current payment record in controller
    };
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (parsed.status && parsed.data) {
            resolve({
              status: parsed.data.status === "success",
              gatewayResponse: parsed.data.gateway_response || parsed.data.status,
              amount: parsed.data.amount / 100 // Convert back to base currency
            });
          } else {
            resolve({
              status: false,
              gatewayResponse: parsed.message || "Failed verification request",
              amount: 0
            });
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};
