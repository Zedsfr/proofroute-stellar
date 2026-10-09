# ProofRoute

ProofRoute is a Soroban prototype for recording verifiable learning and project milestones. A learner signs a transaction to mark a milestone; anyone can subsequently verify it on Stellar Testnet.

## Problem

Learning programs, hackathons and freelance communities need lightweight proof that someone completed a concrete step. Screenshots and spreadsheets are easy to lose or alter; traditional certificates are slow and expensive to issue.

## What this prototype does

`record_progress(learner, milestone)` records a self-authorized milestone in Soroban persistent storage. `has_progress(learner, milestone)` returns whether the milestone has already been recorded. The contract is deliberately small: it is the on-chain verification primitive for a broader credential and rewards product.

## Why Stellar

Stellar is a strong fit for frequent, low-cost attestations and later reward payments. Soroban adds programmable state while Stellar's asset layer can support grants, stablecoin payouts or partner-issued credentials.

## Technical specification

- Language: Rust (`no_std`)
- Runtime: Soroban / WebAssembly (`wasm32v1-none`)
- Storage: persistent key `Progress(Address, Symbol)` → `bool`
- Authorization: the learner must authorize their own milestone with `require_auth()`
- Network: Stellar Testnet

## Deployed contract

ProofRoute is deployed and called on Testnet:

- Deployer: `GDBWSRYGMB66X4APR6PBGAE2IJTUB7KH2C5EPKLIGP2SKBTSA33WZZAT`
- Contract: `CAV4IVUFAZQYYINKCLCANPAYZ6OJMZL6ZD7564BEFI3EWTUGQEQGAPR7`
- Deployment transaction: [`d6c2aa…fe879`](https://stellar.expert/explorer/testnet/tx/d6c2aac4dfc8353b8f391c383fa28cae45fa235090bf1900bcdb49f2337fe879)
- Proof call (`record_progress`): [`a48ed7…a56e4`](https://stellar.expert/explorer/testnet/tx/a48ed74e5750548aca80223dc8304394667ef85329544c3a527acd04d42a56e4)

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

## Hackathon vision

At HackMeridian, ProofRoute becomes a portable proof-and-rewards layer for learning cohorts and community work. Organizers define milestones, mentors co-sign higher-value achievements, and participants can display a verifiable profile without a platform owning their history. The next version adds issuer roles, mentor attestations, batch rewards in stablecoins, and a simple dashboard for communities in Africa and globally.

## Project structure

```text
contracts/bonjour-42/   # ProofRoute Soroban contract and tests
AGENTS.md               # Context for coding agents
```
