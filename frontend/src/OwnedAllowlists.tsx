// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useEffect, useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getObjectExplorerLink } from './utils';
import { ShieldIcon } from 'lucide-react';

export interface Cap {
  id: string;
  allowlist_id: string;
}

export function AllAllowlist() {
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [cardItems, setCardItems] = useState<{ cap_id: string; allowlist_id: string; name: string }[]>([]);

  const getAllowlists = useCallback(async () => {
    const res = await suiClient.getOwnedObjects({
      owner: currentAccount?.address!,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: `${packageId}::allowlist::Cap`,
      },
    });

    const allowlistIds = res.data.map((obj) => {
      const fields = (obj!.data!.content as { fields: any }).fields;
      return {
        cap_id: fields?.id.id,
        allowlist_id: fields?.allowlist_id,
      };
    });

    const allowlists = await Promise.all(
      allowlistIds.map(async (item) => {
        const allowlist = await suiClient.getObject({
          id: item.allowlist_id,
          options: { showContent: true },
        });
        const fields = (allowlist.data?.content as { fields: any })?.fields || {};
        return {
          cap_id: item.cap_id,
          allowlist_id: item.allowlist_id,
          name: fields.name,
        };
      }),
    );

    setCardItems(allowlists);
  }, [currentAccount?.address, packageId, suiClient]);

  useEffect(() => {
    getAllowlists();

    const intervalId = setInterval(() => {
      getAllowlists();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [getAllowlists]);

  return (
    <Card className="border border-[#393E46] bg-[#222831]/80 p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-4">Admin View: Owned Allowlists</h2>
      <p className="text-[#EEEEEE]/70 mb-6">
        These are all the allowlists that you have created. Click manage to edit the allowlist and
        upload new files to the allowlist.
      </p>
      <div className="space-y-4">
        {cardItems.map((item) => (
          <div key={`${item.cap_id} - ${item.allowlist_id}`} className="border border-[#393E46] bg-[#222831] p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EEEEEE] font-medium mb-1">{item.name}</p>
                <p className="text-[#EEEEEE]/70 text-sm">
                  ID {getObjectExplorerLink(item.allowlist_id)}
                </p>
              </div>
              <Button
                className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-4 py-2 rounded-md transition-all"
                onClick={() => {
                  window.open(
                    `${window.location.origin}/allowlist-example/admin/allowlist/${item.allowlist_id}`,
                    '_blank',
                  );
                }}
              >
                <ShieldIcon className="w-5 h-5" />
                Manage
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
