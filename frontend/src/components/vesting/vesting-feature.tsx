'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useVestingProgram } from './vesting-data-access';
import { VestingCreate, VestingList } from './vesting-ui';
import { SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function VestingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useVestingProgram();

  return publicKey ? (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="w-16 h-16 text-purple-400 mr-4" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Token Vesting
              </h1>
              <SparklesIcon className="w-16 h-16 text-blue-400 ml-4" />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              <ShieldCheckIcon className="w-6 h-6 inline mr-2 text-green-400" />
              Secure, transparent, and decentralized token vesting on Solana
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Connected to Devnet</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Program:</span>
                <ExplorerLink
                  path={`account/${programId}`}
                  label={ellipsify(programId.toString())}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Vesting Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02]">
            <VestingCreate />
          </div>

          {/* Vesting List Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02]">
            <VestingList />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-8">
          Token Vesting
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Connect your wallet to start creating and managing token vesting schedules
        </p>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl inline-block">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
