// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getObjectExplorerLink } from './utils';
import { CreditCardIcon } from 'lucide-react';

export interface Cap {
  id: string;
  service_id: string;
}

export function AllServices() {
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [cardItems, setCardItems] = useState<{ id: string; fee: string; ttl: string; name: string }[]>([]);

  useEffect(() => {
    async function getServices() {
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount?.address!,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::subscription::Service`,
        },
      });

      const services = res.data.map((obj) => {
        const fields = (obj!.data!.content as { fields: any }).fields;
        return {
          id: obj!.data!.objectId,
          fee: fields.fee,
          ttl: fields.ttl,
          name: fields.name,
        };
      });

      setCardItems(services);
    }

    getServices();

    const intervalId = setInterval(() => {
      getServices();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentAccount?.address, packageId, suiClient]);

  return (
    <Card className="border border-[#393E46] bg-[#222831]/80 p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-4">Admin View: Owned Subscription Services</h2>
      <p className="text-[#EEEEEE]/70 mb-6">
        This is all the services that you have created. Click manage to upload new files to the
        service.
      </p>
      <div className="space-y-4">
        {cardItems.map((item) => (
          <div key={item.id} className="border border-[#393E46] bg-[#222831] p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-[#EEEEEE] font-medium">{item.name}</p>
                  <p className="text-[#EEEEEE]/70 text-sm">
                    ID {getObjectExplorerLink(item.id)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#EEEEEE]/70 text-sm">
                    Subscription Fee: <span className="text-[#EEEEEE]">{item.fee} MIST</span>
                  </p>
                  <p className="text-[#EEEEEE]/70 text-sm">
                    Duration: <span className="text-[#EEEEEE]">{item.ttl ? parseInt(item.ttl) / 60 / 1000 : 'null'} minutes</span>
                  </p>
                </div>
              </div>
              <Button
                className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-4 py-2 rounded-md transition-all"
                onClick={() => {
                  window.open(
                    `${window.location.origin}/subscription-example/admin/service/${item.id}`,
                    '_blank',
                  );
                }}
              >
                <CreditCardIcon className="w-5 h-5" />
                Manage
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
