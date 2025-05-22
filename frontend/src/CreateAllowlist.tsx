// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@mysten/sui/transactions';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, ListIcon } from 'lucide-react';

export function CreateAllowlist() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  function createAllowlist(name: string) {
    if (name === '') {
      alert('Please enter a name for the allowlist');
      return;
    }
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::allowlist::create_allowlist_entry`,
      arguments: [tx.pure.string(name)],
    });
    tx.setGasBudget(10000000);
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('res', result);
          const allowlistObject = result.effects?.created?.find(
            (item) => item.owner && typeof item.owner === 'object' && 'Shared' in item.owner,
          );
          const createdObjectId = allowlistObject?.reference?.objectId;
          if (createdObjectId) {
            window.open(
              `${window.location.origin}/allowlist-example/admin/allowlist/${createdObjectId}`,
              '_blank',
            );
          }
        },
      },
    );
  }

  const handleViewAll = () => {
    navigate(`/allowlist-example/admin/allowlists`);
  };

  return (
    <Card className="bg-[#393E46] border-[#393E46] p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-6">Admin View: Allowlist</h2>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-[#EEEEEE]/70 text-sm">Allowlist Name</label>
          <input 
            className="bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
            placeholder="Enter name" 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="flex gap-3">
          <Button
            className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-4 py-2 rounded-md transition-all"
            onClick={() => createAllowlist(name)}
          >
            <ShieldIcon className="w-5 h-5" />
            Create Allowlist
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-[#222831] px-4 py-2 rounded-md transition-all"
            onClick={handleViewAll}
          >
            <ListIcon className="w-5 h-5" />
            View All Created Allowlists
          </Button>
        </div>
      </div>
    </Card>
  );
}
