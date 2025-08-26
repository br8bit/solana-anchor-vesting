"use client";

import { getVestingProgramId, VestingIDL } from "@project/anchor";
import { Program } from "@coral-xyz/anchor";
import type { Vesting } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {toast} from "sonner";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

interface CreateVestingArgs {
  companyName: string;
  mint: string;
}

interface CreateEmployeeArgs {
  beneficiary: string;
  startTime: number;
  endTime: number;
  totalAmount: number;
  cliffTime: number;
}

interface ClaimTokensArgs {
  companyName: string;
}

export function useVestingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(() => {
    const id = getVestingProgramId(cluster.network as Cluster);
    console.log('🔍 Debug Info:', {
      clusterName: cluster.name,
      clusterNetwork: cluster.network,
      clusterEndpoint: cluster.endpoint,
      programId: id.toString()
    });
    return id;
  }, [cluster]);
  const program = useMemo(() => {
    // Use the correct program ID that matches the deployed program
    const correctProgramId = new PublicKey('9EaFVdWxtmUro5U23yde2qezeL1LfbRnS4xuwSNDUWND');

    try {
      // Create a completely new IDL object with the correct address
      const modifiedIDL = JSON.parse(JSON.stringify(VestingIDL));
      modifiedIDL.address = correctProgramId.toString();

      // Create program with the modified IDL
      const prog = new Program(modifiedIDL as Vesting, provider) as Program<Vesting>;

      console.log('📋 Program Info:', {
        programId: prog.programId.toString(),
        idlAddress: modifiedIDL.address,
        methods: Object.keys(prog.methods),
        match: prog.programId.toString() === correctProgramId.toString()
      });
      return prog;
    } catch (error) {
      console.error('❌ Error creating program:', error);
      throw error;
    }
  }, [provider]);

  const accounts = useQuery({
    queryKey: ["vesting", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ["vestingAccount", "create", { cluster }],
    mutationFn: async ({ companyName, mint }) => {
      // Calculate the PDA for the vesting account
      const [vestingAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(companyName)],
        program.programId
      );

      console.log('🚀 Creating vesting account with:', {
        companyName,
        mint,
        programId: program.programId.toString(),
        provider: provider.wallet.publicKey?.toString(),
        vestingAccountPDA: vestingAccountPDA.toString()
      });

      try {
        const tx = await program.methods
          .createVestingAccount(companyName)
          .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
          .rpc();

        console.log('✅ Transaction successful:', tx);
        return tx;
      } catch (error) {
        console.error('❌ Transaction failed:', error);
        throw error;
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error);
      toast.error("Failed to initialize account");
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
  };
}

export function useVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useVestingProgram();

  const accountQuery = useQuery({
    queryKey: ["vesting", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });

  const createEmployeeVesting = useMutation<string, Error, CreateEmployeeArgs>({
    mutationKey: ["vesting", "close", { cluster, account }],
    mutationFn: ({ beneficiary, startTime, endTime, totalAmount, cliffTime }) =>
      program.methods
        .createEmployeeVesting(
          new BN(startTime),
          new BN(endTime),
          new BN(totalAmount),
          new BN(cliffTime)
        )
        .accounts({
          beneficiary: new PublicKey(beneficiary),
          vestingAccount: account,
        })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const claimTokens = useMutation<string, Error, ClaimTokensArgs>({
    mutationKey: ["vesting", "claim", { cluster, account }],
    mutationFn: ({ companyName }) =>
      program.methods
        .claimTokens(companyName)
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    createEmployeeVesting,
    claimTokens,
  };
}
