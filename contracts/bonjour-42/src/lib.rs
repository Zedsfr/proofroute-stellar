#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contract]
pub struct ProofRoute;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Progress(Address, Symbol),
}
#[contractimpl]
impl ProofRoute {
    /// Records a self-authorized learning or project milestone.
    pub fn record_progress(env: Env, learner: Address, milestone: Symbol) -> bool {
        learner.require_auth();
        env.storage()
            .persistent()
            .set(&DataKey::Progress(learner, milestone), &true);
        true
    }

    /// Returns whether this learner has already recorded this milestone.
    pub fn has_progress(env: Env, learner: Address, milestone: Symbol) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Progress(learner, milestone))
            .unwrap_or(false)
    }
}

mod test;
