# Project Description

**Deployed Frontend URL:** [TODO: Link to your deployed frontend]

**Solana Program ID:** 9EaFVdWxtmUro5U23yde2qezeL1LfbRnS4xuwSNDUWND

## Project Overview

### Description

A decentralized token vesting application built on Solana that allows companies to create vesting schedules for their employees. The dApp provides a secure, transparent way to manage token distributions with configurable vesting periods, cliff times, and claiming mechanisms. Companies can create vesting accounts with treasuries, set up individual employee vesting schedules, and employees can claim their vested tokens according to the defined schedule.

### Key Features

- **Create Vesting Account**: Companies can create vesting accounts with unique company names and token treasuries
- **Employee Vesting Setup**: Companies can set up individual vesting schedules for employees with start/end times and cliff periods
- **Token Claiming**: Employees can claim vested tokens based on time-based vesting calculations
- **Vesting Calculation**: Automatic calculation of vested amounts based on linear vesting with cliff time support
- **Secure Treasury Management**: Token treasuries secured with PDAs and proper access controls

### How to Use the dApp

1. **Connect Wallet** - Connect your Solana wallet
2. **Create Vesting Account** - Companies create a vesting account by providing a unique company name and token mint address
3. **Set Up Employee Vesting** - Companies configure vesting schedules for employees by specifying beneficiary, start/end times, total amount, and cliff time
4. **Claim Tokens** - Employees claim their vested tokens based on the time-based vesting schedule
5. **View Vesting Details** - Users can view vesting account details, employee vesting information, and claimed amounts

## Program Architecture

The Vesting dApp uses a dual-account architecture with vesting accounts for companies and employee accounts for individuals. The program leverages PDAs to create deterministic addresses for both account types, ensuring security and preventing conflicts.

### PDA Usage

The program uses Program Derived Addresses to create deterministic accounts for vesting and employee records.

**PDAs Used:**

- **Vesting Account PDA**: Derived from seeds `[company_name]` - ensures each company has a unique vesting account with treasury
- **Employee Account PDA**: Derived from seeds `["employee_vesting", beneficiary_pubkey, vesting_account_pubkey]` - ensures each employee has a unique vesting schedule per company
- **Treasury Token Account PDA**: Derived from seeds `["vesting_treasury", company_name]` - secure treasury for holding tokens to be vested

### Program Instructions

**Instructions Implemented:**

- **CreateVestingAccount**: Creates a new vesting account for a company with an associated treasury token account
- **CreateEmployeeVesting**: Sets up a vesting schedule for an employee with specified parameters (start/end times, total amount, cliff time)
- **ClaimTokens**: Allows employees to claim their vested tokens according to the time-based vesting schedule

### Account Structure

```rust
#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    pub owner: Pubkey,              // The company wallet that owns this vesting account
    pub mint: Pubkey,               // Token mint address for the vesting tokens
    pub treasury_token_account: Pubkey, // Treasury token account holding the tokens to be vested
    pub treasury_bump: u8,          // Bump seed for the treasury PDA
    pub bump: u8,                   // Bump seed for this account's PDA
    #[max_len(50)]
    pub company_name: String,       // Unique company name identifier
}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {
    pub vesting_account: Pubkey,    // Reference to the company's vesting account
    pub beneficiary: Pubkey,        // Employee wallet that can claim tokens
    pub start_time: i64,            // Unix timestamp when vesting starts
    pub end_time: i64,              // Unix timestamp when vesting ends
    pub total_amount: i64,          // Total amount of tokens to be vested
    pub total_withdrawn: i64,       // Amount of tokens already claimed
    pub cliff_time: i64,            // Unix timestamp when cliff period ends
    pub bump: u8,                   // Bump seed for this account's PDA
}
```

## Testing

### Test Coverage

Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**

- **Create Vesting Account**: Successfully creates a new vesting account with treasury token account
- **Create Employee Vesting**: Properly sets up employee vesting schedule with all parameters
- **Claim Tokens**: Successfully transfers vested tokens to employee's token account

**Unhappy Path Tests:**

- **Claim Before Cliff**: Fails when employee tries to claim tokens before cliff time
- **Claim Nothing to Claim**: Fails when employee tries to claim when no tokens are available
- **Unauthorized Employee Setup**: Fails when non-owner tries to set up employee vesting
- **Unauthorized Token Claim**: Fails when non-beneficiary tries to claim tokens

### Running Tests

```bash
npm install         # install dependencies
anchor test         # run tests
```

### Additional Notes for Evaluators

This vesting program demonstrates advanced Solana development concepts including complex PDA structures, time-based calculations, cross-program invocations for token transfers, and proper error handling. The program implements a realistic vesting model with cliff periods and linear vesting over time, similar to what you might find in real-world token distribution scenarios. The frontend provides an intuitive interface for both company administrators and employees to manage and claim vesting schedules.
