#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

#[test]
fn test() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ProofRoute, ());
    let client = ProofRouteClient::new(&env, &contract_id);
    let learner = Address::generate(&env);
    let milestone = Symbol::new(&env, "stellar_101");

    assert!(!client.has_progress(&learner, &milestone));
    assert!(client.record_progress(&learner, &milestone));
    assert!(client.has_progress(&learner, &milestone));
}
