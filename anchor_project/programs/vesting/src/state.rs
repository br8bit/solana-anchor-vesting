use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury_token_account: Pubkey,
    pub treasury_bump: u8,
    pub bump: u8,
    #[max_len(50)]
    pub company_name: String,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {
    pub vesting_account: Pubkey,
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: i64,
    pub total_withdrawn: i64,
    pub cliff_time: i64,
    pub bump: u8,
}