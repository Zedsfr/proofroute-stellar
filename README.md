# ProofRoute

> **Demo phrase:** an AI agent pays $0.01 via x402 to pre-review a learner's evidence; a mentor then co-signs the verified milestone on Stellar.

ProofRoute is the genesis of a proof-and-rewards product for learning cohorts, hackathons and community work. It combines a **Soroban smart contract** for durable attestations, an **AI review agent** for evidence triage, and a paid **x402 API** so software agents can pay per review.

## Live visual demo

Explore the project narrative and the end-to-end flow: **[Zedsfr.github.io/proofroute-stellar](https://zedsfr.github.io/proofroute-stellar/)**.

## The one flow we are building

**A cohort mentor in Abidjan spends five minutes checking every learner submission.** For 100 submissions, that is more than eight hours of repetitive review.

1. A learner submits a milestone and an evidence link to ProofRoute.
2. An AI agent buys a $0.01 review through the x402 endpoint and returns a structured recommendation.
3. The learner records their milestone on the ProofRoute Soroban contract.
4. For high-confidence work, the mentor co-signs an attestation. Anyone can verify it on Stellar without trusting ProofRoute's database.

This is intentionally one complete path: **pay for triage → make an on-chain claim → mentor attests**.

## Problem

Learning programs, hackathons and freelance communities need lightweight proof that someone completed a concrete step. Screenshots and spreadsheets are easy to lose or alter; traditional certificates are slow and expensive to issue. More immediately, mentors lose time reviewing repetitive evidence before they can focus on the cases that need judgment.

## What already works

`record_progress(learner, milestone)` records a self-authorized milestone in Soroban persistent storage. A mentor or organizer can additionally call `attest(mentor, learner, milestone)`; only that mentor can authorize their attestation. `has_progress` and `has_attestation` let any application check the corresponding on-chain state.

The contract is deliberately small: it is the on-chain proof primitive. The agent can recommend an action, but can never sign a transaction or access a wallet secret.

## Why Stellar

Stellar is a strong fit for frequent, low-cost attestations and later reward payments. Soroban adds programmable state while Stellar's asset layer can support grants, stablecoin payouts or partner-issued credentials.

## Technical specification

- Language: Rust (`no_std`)
- Runtime: Soroban / WebAssembly (`wasm32v1-none`)
- Storage: persistent key `Progress(Address, Symbol)` → `bool`
- Authorization: the learner must authorize their own milestone with `require_auth()`
- Mentor attestations: persistent key `Attestation(mentor, learner, Symbol)` → `bool`, authorized with the mentor's `require_auth()`
- Network: Stellar Testnet

## AI review agent (prototype)

`apps/proofroute-agent` contains an API that accepts a learner address, a milestone and evidence. It sends a constrained review prompt to an OpenAI-compatible model endpoint and returns a recommendation: record the milestone, request a mentor attestation, or ask for human review. It does not make blockchain claims without supplied evidence and it never receives or stores a wallet secret.

The agent is intentionally separated from custody: it proposes; the learner or mentor signs the Soroban transaction from their own wallet.

## x402 paid API (prototype)

The same service protects `POST /api/review` with the official x402 Express middleware. An API client first receives an HTTP `402 Payment Required` response, signs a $0.01 USDC payment on Base, then retries. The x402 facilitator verifies and settles payment before the agent runs. This makes ProofRoute's evidence review usable by other software agents without accounts or subscriptions.

The payment rail is intentionally Base/x402 while durable attestations are Stellar/Soroban. ProofRoute does **not** claim that x402 is exclusive to Stellar; it composes the best rail for each job. The included configuration defaults to Base mainnet (`eip155:8453`) but has no recipient address or API key committed. It is a safe, runnable integration template; configure environment variables and perform a separate test payment before production use.

## Deployed contracts

The original capstone contract is deployed and called on Testnet:

- Deployer: `GDBWSRYGMB66X4APR6PBGAE2IJTUB7KH2C5EPKLIGP2SKBTSA33WZZAT`
- Contract: `CAV4IVUFAZQYYINKCLCANPAYZ6OJMZL6ZD7564BEFI3EWTUGQEQGAPR7`
- Deployment transaction: [`d6c2aa…fe879`](https://stellar.expert/explorer/testnet/tx/d6c2aac4dfc8353b8f391c383fa28cae45fa235090bf1900bcdb49f2337fe879)
- Proof call (`record_progress`): [`a48ed7…a56e4`](https://stellar.expert/explorer/testnet/tx/a48ed74e5750548aca80223dc8304394667ef85329544c3a527acd04d42a56e4)

The enriched version adds mentor attestations and is also deployed and exercised on Testnet:

- Contract v2: `CCG73E2VVN6ZQD7C4K6E4BT2C4JU4WDO22STB3U67LGWXY55UTZC4TWM`
- WASM upload: [`b46ac1…7a89f`](https://stellar.expert/explorer/testnet/tx/b46ac1b58d298675674c8524fd60776b883c237917ae2a37368896500807a89f)
- Deployment: [`111b7a…cc185`](https://stellar.expert/explorer/testnet/tx/111b7a138632fef3106071f553fc24b0abd16c5b50513cf5fd7bb257dafcc185)
- On-chain learner proof: [`427ea8…da256`](https://stellar.expert/explorer/testnet/tx/427ea8edb5b5b3a6fb833cad51285bb8d661f440003b11931a6bb4089c7da256)
- On-chain mentor attestation: [`258e64…03a8d`](https://stellar.expert/explorer/testnet/tx/258e643b507d46ae002cb0bf01b4c60877ed3a235848585dbd4fe8e76de03a8d)

## Reproduce locally

```sh
brew install stellar-cli
rustup target add wasm32v1-none
stellar network use testnet

cargo test
stellar contract build

stellar contract deploy \
  --wasm target/wasm32v1-none/release/bonjour_42.wasm \
  --source-account <your-identity> \
  --network testnet \
  --alias proofroute

stellar contract invoke \
  --id proofroute \
  --source-account <your-identity> \
  --network testnet \
  --send=yes \
  -- record_progress --learner <your-G-address> --milestone stellar_101
```

### Run the agent and x402 service

```sh
cd apps/proofroute-agent
cp .env.example .env
# Fill X402_PAY_TO with a receiver EVM address and MODEL_API_KEY locally.
npm install
npm run check
npm start
```

`GET /health` is free. `POST /api/review` is the paid route. A client without a payment gets the standard x402 `402 Payment Required` challenge; a paid request is verified by the configured facilitator before it reaches the review agent.

## What we will ship at HackMeridian

The capstone is deliberately a genesis, not a finished company. At HackMeridian, we will turn this code into a short, polished demo:

1. A learner enters one evidence link in a simple interface.
2. An AI agent pays the x402 endpoint and returns a review.
3. The learner records the milestone from their Stellar wallet.
4. A mentor clicks to co-sign it; the screen shows the resulting testnet transaction.

The outcome is a portable proof that no platform owns. The next iteration adds organizer-defined milestones, profiles and Stellar stablecoin rewards for verified community contributions.

## What is real vs. what is next

| Already in this repository | To finish during the hackathon |
| --- | --- |
| Deployed and called Soroban proof contract | Polished learner/mentor interface |
| Mentor-attestation contract code + tests | Live x402 payment settlement with a configured receiver |
| AI review agent service code | Hosted model credentials and a production review policy |
| x402 middleware protecting the review endpoint | End-to-end screen recording / demo video |

## Project structure

```text
contracts/bonjour-42/   # ProofRoute Soroban contract and tests
apps/proofroute-agent/  # AI reviewer + x402-protected HTTP API
docs/                   # Public visual demo, deployed with GitHub Pages
AGENTS.md               # Context for coding agents
```
