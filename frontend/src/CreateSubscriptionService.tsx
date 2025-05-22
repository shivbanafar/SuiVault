// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@mysten/sui/transactions';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, ListIcon } from 'lucide-react';

export function CreateService() {
  const [price, setPrice] = useState('');
  const [ttl, setTtl] = useState('');
  const [name, setName] = useState('');
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const navigate = useNavigate();
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

  function createService(price: number, ttl: number, name: string) {
    if (price === 0 || ttl === 0 || name === '') {
      alert('Please fill in all fields');
      return;
    }
    const ttlMs = ttl * 60 * 1000;
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::subscription::create_service_entry`,
      arguments: [tx.pure.u64(price), tx.pure.u64(ttlMs), tx.pure.string(name)],
    });
    tx.setGasBudget(10000000);
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('res', result);
          const subscriptionObject = result.effects?.created?.find(
            (item) => item.owner && typeof item.owner === 'object' && 'Shared' in item.owner,
          );
          const createdObjectId = subscriptionObject?.reference?.objectId;
          if (createdObjectId) {
            window.open(
              `${window.location.origin}/subscription-example/admin/service/${createdObjectId}`,
              '_blank',
            );
          }
        },
      },
    );
  }

  const handleViewAll = () => {
    navigate(`/subscription-example/admin/services`);
  };

  return (
    <Card className="bg-[#393E46] border-[#393E46] p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-6">Admin View: Subscription</h2>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-[#EEEEEE]/70 text-sm">Price in Mist</label>
          <input 
            className="bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
            placeholder="Enter price" 
            onChange={(e) => setPrice(e.target.value)} 
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-[#EEEEEE]/70 text-sm">Subscription Duration (minutes)</label>
          <input 
            className="bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
            placeholder="Enter duration" 
            onChange={(e) => setTtl(e.target.value)} 
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-[#EEEEEE]/70 text-sm">Service Name</label>
          <input 
            className="bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
            placeholder="Enter name" 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="flex gap-3">
          <Button
            className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-4 py-2 rounded-md transition-all"
            onClick={() => createService(parseInt(price), parseInt(ttl), name)}
          >
            <CreditCardIcon className="w-5 h-5" />
            Create Service
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-[#222831] px-4 py-2 rounded-md transition-all"
            onClick={handleViewAll}
          >
            <ListIcon className="w-5 h-5" />
            View All Created Services
          </Button>
        </div>
      </div>
    </Card>
  );
}
