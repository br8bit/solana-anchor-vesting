use anchor_lang::prelude::*;

declare_id!("9EaFVdWxtmUro5U23yde2qezeL1LfbRnS4xuwSNDUWND");

pub mod errors;
pub mod instructions;
pub mod state;

use crate::instructions::*;

#[program]
pub mod vesting {
    use super::*;

    pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        CreateVestingAccount::create_vesting_account(ctx, company_name)
    }

    pub fn create_employee_vesting(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        total_amount: i64,
        cliff_time: i64,
    ) -> Result<()> {
        CreateEmployeeAccount::create_employee_vesting(
            ctx,
            start_time,
            end_time,
            total_amount,
            cliff_time,
        )
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>, company_name: String) -> Result<()> {
        ClaimTokens::claim_tokens(ctx, company_name)
    }
}
