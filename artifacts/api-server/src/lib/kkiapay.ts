/**
 * Kkiapay payment verification module
 * Verifies transactions with Kkiapay API using official endpoint
 * API: POST https://api.kkiapay.me/api/v1/transactions/status
 * Headers: X-API-KEY, X-PRIVATE-KEY, X-SECRET-KEY
 */

export interface KkiapayVerifyRequest {
  transactionId: string;
}

export interface KkiapayVerifyResponse {
  status: string; // "SUCCESS", "FAILED", etc.
  transaction?: {
    id: string;
    status: string;
    amount: number;
    currency?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export class KkiapayError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "KkiapayError";
  }
}

/**
 * Verify a Kkiapay transaction
 * Calls Kkiapay API with X-API-KEY, X-PRIVATE-KEY, X-SECRET-KEY headers
 * @param transactionId Transaction ID from frontend after payment
 * @param expectedAmountCents Expected amount in cents
 * @param expectedCurrency Expected currency code
 * @returns Transaction details if verification succeeds
 * @throws KkiapayError if verification fails or credentials missing
 */
export async function verifyKkiapayTransaction(
  transactionId: string,
  expectedAmountCents: number,
  expectedCurrency: string
): Promise<KkiapayVerifyResponse> {
  const apiKey = process.env.KKIAPAY_PUBLIC_KEY;
  const privateKey = process.env.KKIAPAY_PRIVATE_KEY;
  const secretKey = process.env.KKIAPAY_SECRET_KEY;

  // Validate all three keys are present
  if (!apiKey || !privateKey || !secretKey) {
    throw new KkiapayError(
      "KKIAPAY_UNCONFIGURED",
      "Kkiapay credentials not configured. Contact administrator.",
      503
    );
  }

  if (!transactionId || !transactionId.trim()) {
    throw new KkiapayError(
      "INVALID_TRANSACTION_ID",
      "Transaction ID is required and cannot be empty.",
      400
    );
  }

  try {
    // Call Kkiapay status endpoint
    const response = await fetch(
      "https://api.kkiapay.me/api/v1/transactions/status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          "X-PRIVATE-KEY": privateKey,
          "X-SECRET-KEY": secretKey,
        },
        body: JSON.stringify({ transactionId }),
      }
    );

    if (!response.ok) {
      // Kkiapay returned an error response
      const errorData = await response.json().catch(() => ({}));
      console.error("Kkiapay API error response:", errorData);
      throw new KkiapayError(
        "KKIAPAY_API_ERROR",
        `Kkiapay API error: ${errorData.message || response.statusText}`,
        response.status >= 500 ? 502 : 400
      );
    }

    const data: KkiapayVerifyResponse = await response.json();

    // Verify transaction status is SUCCESS
    if (data.status !== "SUCCESS" || data.transaction?.status !== "SUCCESS") {
      throw new KkiapayError(
        "TRANSACTION_NOT_SUCCESS",
        `Transaction status is ${data.status || data.transaction?.status || "unknown"}, not SUCCESS.`,
        402 // Payment Required
      );
    }

    // Verify amount matches exactly (in cents)
    const transactionAmountCents = Math.round(
      (data.transaction?.amount || 0) * 100
    );
    if (transactionAmountCents !== expectedAmountCents) {
      throw new KkiapayError(
        "AMOUNT_MISMATCH",
        `Transaction amount (${transactionAmountCents} cents) does not match expected amount (${expectedAmountCents} cents).`,
        402 // Payment Required
      );
    }

    // All validations passed
    return data;
  } catch (error) {
    // If it's already a KkiapayError, re-throw as-is
    if (error instanceof KkiapayError) {
      throw error;
    }

    // Network or JSON parsing errors
    console.error("Kkiapay verification error:", error);
    throw new KkiapayError(
      "VERIFICATION_FAILED",
      error instanceof Error ? error.message : "Failed to verify transaction.",
      502
    );
  }
}
