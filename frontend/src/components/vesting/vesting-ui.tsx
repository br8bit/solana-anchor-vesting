"use client";

import { PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import {
  useVestingProgram,
  useVestingProgramAccount,
} from "./vesting-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PlusCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [company, setCompany] = useState("");
  const [mint, setMint] = useState("9vDQXUf8uxFTYe1zq1kbFSoFT7YVnMPX7kkXJ7sEHjCW");

  const isFormValid = company.length > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <PlusCircleIcon className="w-8 h-8 text-purple-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Create Vesting Account</h2>
        </div>
        <p className="text-gray-300">Set up a new token vesting schedule</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Company Name Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-200">
            <BuildingOfficeIcon className="w-4 h-4 mr-2 text-purple-400" />
            Company Name
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter unique company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium whitespace-nowrap"
              onClick={() => setCompany(`Company_${Date.now()}`)}
            >
              Generate
            </button>
          </div>
        </div>

        {/* Token Mint Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-200">
            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-400" />
            Token Mint Address
          </label>
          <input
            type="text"
            placeholder="Enter token mint address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            createVestingAccount.isPending || !isFormValid
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
          onClick={handleSubmit}
          disabled={createVestingAccount.isPending || !isFormValid}
        >
          {createVestingAccount.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Vesting Account'
          )}
        </button>
      </div>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white">Loading program...</span>
        </div>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="text-yellow-400 text-lg font-semibold mb-2">Program Not Found</div>
          <p className="text-gray-300">
            Make sure you have deployed the program and are on the correct cluster.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <UserGroupIcon className="w-8 h-8 text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Vesting Accounts</h2>
        </div>
        <p className="text-gray-300">Manage your token vesting schedules</p>
      </div>

      {/* Content */}
      {accounts.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white">Loading accounts...</span>
          </div>
        </div>
      ) : accounts.data?.length ? (
        <div className="space-y-4">
          {accounts.data?.map((account) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-8">
            <div className="text-blue-400 text-xl font-semibold mb-3">No Vesting Accounts</div>
            <p className="text-gray-300 mb-4">
              You haven't created any vesting accounts yet.
            </p>
            <p className="text-gray-400 text-sm">
              Create your first vesting account using the form on the left.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting, claimTokens } = useVestingProgramAccount({
    account,
  });
  const [beneficiary, setBeneficiary] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? "Unknown Company",
    [accountQuery.data?.companyName]
  );

  return accountQuery.isLoading ? (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white">Loading account...</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h3
          className="text-2xl font-bold text-white cursor-pointer hover:text-purple-300 transition-colors"
          onClick={() => accountQuery.refetch()}
          title="Click to refresh"
        >
          {companyName}
        </h3>
        <p className="text-gray-400 text-sm mt-1">Vesting Account</p>
      </div>

      {/* Employee Vesting Form */}
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <ClockIcon className="w-6 h-6 text-orange-400 mr-2" />
            <h4 className="text-lg font-semibold text-white">Create Employee Vesting</h4>
          </div>
          <p className="text-gray-400 text-sm">Set up vesting schedule for an employee</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Beneficiary wallet address"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Start time (Unix)"
              value={startTime || ""}
              onChange={(e) => setStartTime(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="End time (Unix)"
              value={endTime || ""}
              onChange={(e) => setEndTime(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Cliff time (Unix)"
              value={cliffTime || ""}
              onChange={(e) => setCliffTime(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Total tokens"
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4">
          <button
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
              createEmployeeVesting.isPending
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02]'
            }`}
            onClick={() =>
              createEmployeeVesting.mutateAsync({
                beneficiary,
                startTime,
                endTime,
                totalAmount,
                cliffTime,
              })
            }
            disabled={createEmployeeVesting.isPending}
          >
            {createEmployeeVesting.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <SparklesIcon className="w-5 h-5" />
                <span>Create Employee Vesting</span>
              </div>
            )}
          </button>

          <button
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
              claimTokens.isPending
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02]'
            }`}
            onClick={() =>
              claimTokens.mutateAsync({
                companyName: companyName.toString(),
              })
            }
            disabled={claimTokens.isPending}
          >
            {claimTokens.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Claiming...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <GiftIcon className="w-5 h-5" />
                <span>Claim Tokens</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
