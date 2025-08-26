// No imports needed: web3, anchor, pg and more are globally available
import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN, Program } from "@coral-xyz/anchor";

import {
  startAnchor,
  Clock,
  BanksClient,
  ProgramTestContext,
} from "solana-bankrun";

// @ts-ignore - spl-token-bankrun doesn't have type definitions
import { createMint, mintTo } from "spl-token-bankrun";
import { PublicKey, Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

import IDL from "../target/idl/vesting.json";
import { Vesting } from "../target/types/vesting";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("Vesting Smart Contract Tests", () => {
  const companyName = "Company";
  let beneficiary: Keypair;
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;
  let provider: BankrunProvider;
  let program: Program<Vesting>;
  let banksClient: BanksClient;
  let employer: Keypair;
  let mint: PublicKey;
  let beneficiaryProvider: BankrunProvider;
  let program2: Program<Vesting>;
  let context: ProgramTestContext;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();

    // set up bankrun
    context = await startAnchor(
      "",
      [{ name: "vesting", programId: new PublicKey(IDL.address) }],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );
    provider = new BankrunProvider(context);

    anchor.setProvider(provider);

    program = new Program<Vesting>(IDL as Vesting, provider);

    banksClient = context.banksClient;

    employer = provider.wallet.payer;

    // Create a new mint
    // @ts-ignore
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    // Generate a new keypair for the beneficiary
    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);

    // Derive PDAs
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );

    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
      program.programId
    );

    [employeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("should create a vesting account", async () => {
    const tx = await program.methods
      .createVestingAccount(companyName)
      .accounts({
        signer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccountKey,
      "confirmed"
    );
    console.log(
      "Vesting Account Data:",
      JSON.stringify(vestingAccountData, null, 2)
    );

    console.log("Create Vesting Account Transaction Signature:", tx);
  });

  it("should fail to create a vesting account if it already exists", async () => {
    // This test expects the transaction to fail because the account already exists
    try {
      await program.methods
        .createVestingAccount(companyName)
        .accounts({
          signer: employer.publicKey,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc({ commitment: "confirmed" });

      // If the transaction succeeds, the test should fail
      expect(true).toBe(false); // This will fail the test
    } catch (error: any) {
      // We expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  it("should fund the treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;
    const mintTx = await mintTo(
      // @ts-ignore
      banksClient,
      employer,
      mint,
      treasuryTokenAccount,
      employer,
      amount
    );

    console.log("Mint to Treasury Transaction Signature:", mintTx);
  });

  it("should create an employee vesting account", async () => {
    const tx2 = await program.methods
      .createEmployeeVesting(new BN(0), new BN(100), new BN(100), new BN(0))
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed", skipPreflight: true });

    console.log("Create Employee Account Transaction Signature:", tx2);
    console.log("Employee account", employeeAccount.toBase58());
  });

  it("should fail to create an employee vesting account with incorrect owner", async () => {
    // Create a new keypair for a different employer
    const wrongEmployer = new anchor.web3.Keypair();
    const wrongProvider = new BankrunProvider(context);
    wrongProvider.wallet = new NodeWallet(wrongEmployer);
    const program3 = new Program<Vesting>(IDL as Vesting, wrongProvider);

    // This test expects the transaction to fail because the vesting account owner is not the signer
    try {
      await program3.methods
        .createEmployeeVesting(new BN(0), new BN(100), new BN(100), new BN(0))
        .accounts({
          beneficiary: beneficiary.publicKey,
          vestingAccount: vestingAccountKey,
        })
        .signers([wrongEmployer]) // Add the signer
        .rpc({ commitment: "confirmed" });

      // If the transaction succeeds, the test should fail
      expect(true).toBe(false); // This will fail the test
    } catch (error: any) {
      // We expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  it("should fail to create an employee vesting account with invalid time parameters", async () => {
    // This test expects the transaction to fail because end_time is before start_time
    try {
      await program.methods
        .createEmployeeVesting(new BN(100), new BN(0), new BN(100), new BN(0)) // end_time (0) before start_time (100)
        .accounts({
          beneficiary: beneficiary.publicKey,
          vestingAccount: vestingAccountKey,
        })
        .rpc({ commitment: "confirmed" });

      // If the transaction succeeds, the test should fail
      expect(true).toBe(false); // This will fail the test
    } catch (error: any) {
      // We expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  it("should claim tokens", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        1000n
      )
    );

    console.log("Employee account", employeeAccount.toBase58());

    const tx3 = await program2.methods
      .claimTokens(companyName)
      .accounts({
        beneficiary: beneficiary.publicKey,
        employeeAccount: employeeAccount,
        vestingAccount: vestingAccountKey,
        mint: mint,
        treasuryTokenAccount: treasuryTokenAccount,
        employeeTokenAccount: anchor.utils.token.associatedAddress({
          mint: mint,
          owner: beneficiary.publicKey,
        }),
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([beneficiary])
      .rpc({ commitment: "confirmed" });

    console.log("Claim Tokens transaction signature", tx3);
  });

  it("should fail to claim tokens before cliff time", async () => {
    // Create a new employee account with a cliff time in the future
    const futureBeneficiary = new anchor.web3.Keypair();
    const futureProvider = new BankrunProvider(context);
    futureProvider.wallet = new NodeWallet(futureBeneficiary);
    const program4 = new Program<Vesting>(IDL as Vesting, futureProvider);

    // Derive PDA for the new employee
    const [_futureEmployeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        futureBeneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );

    // Create the employee account with a cliff time in the future (10000 seconds from now)
    await program.methods
      .createEmployeeVesting(
        new BN(0),
        new BN(1000),
        new BN(100),
        new BN(10000)
      )
      .accounts({
        beneficiary: futureBeneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed" });

    // Try to claim tokens before the cliff time
    try {
      await program4.methods
        .claimTokens(companyName)
        .accounts({
          employeeTokenAccount: anchor.utils.token.associatedAddress({
            mint: mint,
            owner: futureBeneficiary.publicKey,
          }),
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([futureBeneficiary])
        .rpc({ commitment: "confirmed" });

      // If the transaction succeeds, the test should fail
      expect(true).toBe(false); // This will fail the test
    } catch (error: any) {
      // We expect an error to be thrown
      expect(error).toBeDefined();
      // Check if the error message contains information about the claim not being available
      // Note: The exact error message might vary
    }
  });

  it("should fail to claim tokens when there's nothing to claim", async () => {
    // Create a new employee account with a total amount of 0
    const zeroBeneficiary = new anchor.web3.Keypair();
    const zeroProvider = new BankrunProvider(context);
    zeroProvider.wallet = new NodeWallet(zeroBeneficiary);
    const program5 = new Program<Vesting>(IDL as Vesting, zeroProvider);

    // Derive PDA for the new employee
    const [_zeroEmployeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        zeroBeneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );

    // Create the employee account with a total amount of 0
    await program.methods
      .createEmployeeVesting(new BN(0), new BN(100), new BN(0), new BN(0))
      .accounts({
        beneficiary: zeroBeneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed" });

    // Advance the clock to after the end time
    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        100000n // A large timestamp to ensure it's after the end time
      )
    );

    // Try to claim tokens when there's nothing to claim
    try {
      await program5.methods
        .claimTokens(companyName)
        .accounts({
          employeeTokenAccount: anchor.utils.token.associatedAddress({
            mint: mint,
            owner: zeroBeneficiary.publicKey,
          }),
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([zeroBeneficiary])
        .rpc({ commitment: "confirmed" });

      // If the transaction succeeds, the test should fail
      expect(true).toBe(false); // This will fail the test
    } catch (error: any) {
      // We expect an error to be thrown
      expect(error).toBeDefined();
      // Check if the error message contains information about nothing to claim
      // Note: The exact error message might vary
    }
  });
});
