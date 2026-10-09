const express = require("express");
const { paymentMiddleware } = require("@x402/express");
const { x402ResourceServer, HTTPFacilitatorClient } = require("@x402/core/server");
const { ExactEvmScheme } = require("@x402/evm/exact/server");
const { reviewEvidence } = require("./review-agent");

const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "proofroute-agent" }));

const payTo = process.env.X402_PAY_TO;
if (!payTo) {
  throw new Error("X402_PAY_TO is required. Copy .env.example to .env and configure a receiver address.");
}

// x402 uses HTTP 402 to negotiate a per-request USDC payment. The facilitator
// verifies and settles a valid payment before the AI agent processes evidence.
const facilitator = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
});
const resourceServer = new x402ResourceServer(facilitator);
resourceServer.register("eip155:8453", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "POST /api/review": {
        accepts: {
          scheme: "exact",
          price: "$0.01",
          network: "eip155:8453",
          payTo,
        },
        description: "AI review of a ProofRoute milestone evidence package",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.post("/api/review", async (req, res) => {
  try {
    const review = await reviewEvidence(req.body);
    res.json({
      review,
      next_step: "The wallet owner or mentor signs the recommended Soroban transaction; this API never holds a Stellar secret.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`ProofRoute x402 agent listening on :${process.env.PORT || 3000}`);
});
