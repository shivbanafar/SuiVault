// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@mysten/sui/transactions';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, ListIcon, ClockIcon, TagIcon, FileTextIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeIn } from '@/lib/animations';

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <Card className="border border-[#393E46] bg-transparent">
        <CardHeader>
          <motion.div variants={staggerItem}>
            <CardTitle className="text-[#EEEEEE]">Create Subscription Service</CardTitle>
          </motion.div>
          <motion.div variants={staggerItem}>
            <CardDescription className="text-[#EEEEEE]/70">
              Create a new subscription service to share your files securely. Set the price, duration, and name for your service.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Price Input Card */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border border-[#393E46] bg-[#222831]/80 hover:bg-[#222831] transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00ADB5]/10 p-3 rounded-lg">
                      <TagIcon className="w-6 h-6 text-[#00ADB5]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#EEEEEE]">Price</CardTitle>
                      <CardDescription className="text-[#EEEEEE]/70 mt-2">
                        Set the subscription fee in MIST
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <input 
                    className="w-full bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
                    placeholder="Enter price in MIST" 
                    onChange={(e) => setPrice(e.target.value)} 
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Duration Input Card */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border border-[#393E46] bg-[#222831]/80 hover:bg-[#222831] transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00ADB5]/10 p-3 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-[#00ADB5]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#EEEEEE]">Duration</CardTitle>
                      <CardDescription className="text-[#EEEEEE]/70 mt-2">
                        Set subscription duration in minutes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <input 
                    className="w-full bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
                    placeholder="Enter duration in minutes" 
                    onChange={(e) => setTtl(e.target.value)} 
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Name Input Card */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border border-[#393E46] bg-[#222831]/80 hover:bg-[#222831] transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00ADB5]/10 p-3 rounded-lg">
                      <FileTextIcon className="w-6 h-6 text-[#00ADB5]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#EEEEEE]">Service Name</CardTitle>
                      <CardDescription className="text-[#EEEEEE]/70 mt-2">
                        Give your service a descriptive name
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <input 
                    className="w-full bg-[#222831] border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all" 
                    placeholder="Enter service name" 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={staggerItem}
            className="flex gap-4 mt-8 justify-end"
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-[#222831] px-6 py-2 rounded-md transition-all"
              onClick={handleViewAll}
            >
              <ListIcon className="w-5 h-5" />
              View All Services
            </Button>
            <Button
              className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-6 py-2 rounded-md transition-all"
              onClick={() => createService(parseInt(price), parseInt(ttl), name)}
            >
              <CreditCardIcon className="w-5 h-5" />
              Create Service
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
