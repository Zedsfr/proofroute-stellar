const REQUIRED_FIELDS = ["learner", "milestone", "evidence"];

function validateRequest(input) {
  const missing = REQUIRED_FIELDS.filter((field) => !input?.[field]);
  if (missing.length) {
    throw new Error(`Missing required field(s): ${missing.join(", ")}`);
  }
}

/**
 * A small, auditable agent boundary: the model may recommend an outcome, but
 * it never signs a Stellar transaction. The learner or mentor must still sign
 * record_progress or attest with their own wallet.
 */
async function reviewEvidence(input) {
  validateRequest(input);
  const apiUrl = process.env.MODEL_API_URL;
  const apiKey = process.env.MODEL_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("MODEL_API_URL and MODEL_API_KEY must be configured to run the review agent");
  }

  const prompt = [
    "You are ProofRoute's evidence-review agent.",
    "Assess the evidence for a proposed learning or community milestone.",
    "Return JSON only with: decision (approve|needs_review|reject), rationale (max 80 words), and recommended_onchain_action (record_progress|request_mentor_attestation|none).",
    "Never claim an on-chain fact is true unless it is supplied as evidence. Never request a wallet secret.",
    `Learner: ${input.learner}`,
    `Milestone: ${input.milestone}`,
    `Evidence: ${input.evidence}`,
  ].join("\n");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.MODEL_NAME || "gpt-4.1-mini",
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Model request failed with ${response.status}`);
  }

  const body = await response.json();
  const text = body.output_text || body.choices?.[0]?.message?.content;
  if (!text) throw new Error("Model returned no review text");

  return { raw_model_review: text };
}

module.exports = { reviewEvidence };
