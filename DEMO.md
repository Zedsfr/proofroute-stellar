# ProofRoute demo script

## One sentence

An AI agent pays $0.01 to pre-review a learner's evidence, then a mentor co-signs the verified milestone on Stellar.

## 90-second demo

1. **Problem (10s).** “A cohort mentor loses five minutes on every evidence submission. At 100 submissions, that is more than eight hours of repetitive work.”
2. **Agent payment (20s).** Show `POST /api/review` returning an x402 `402 Payment Required` challenge. Explain that another agent pays a small amount only when it needs a review.
3. **Agent output (20s).** Show the structured recommendation: `record_progress`, `request_mentor_attestation`, or `needs_review`. The agent never has a wallet secret and cannot sign for a learner.
4. **Stellar proof (25s).** The learner signs `record_progress`; the mentor signs `attest`. Open the Stellar Testnet transaction and verify the attestation state.
5. **Why it matters (15s).** “We use x402 for agent-to-agent, pay-per-call access and Stellar/Soroban for portable attestations and eventual rewards. The rails are complementary.”

## Guardrails to say out loud

- The AI is triage, not the final authority for high-value claims.
- The learner and mentor each sign their own actions.
- There is no private key in the service or repository.
- The current repository is a working genesis; the end-to-end hosted experience is the HackMeridian build.
