// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNetworkVariable } from './networkConfig';
import { getObjectExplorerLink } from './utils';

export interface Service {
  id: string;
  fee: number;
  ttl: number;
  owner: string;
  name: string;
}

interface AllowlistProps {
  setRecipientAllowlist: React.Dispatch<React.SetStateAction<string>>;
  setCapId: React.Dispatch<React.SetStateAction<string>>;
}

export function Service({ setRecipientAllowlist, setCapId }: AllowlistProps) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable('packageId');
  const currentAccount = useCurrentAccount();
  const [service, setService] = useState<Service>();
  const { id } = useParams();

  useEffect(() => {
    async function getService() {
      // load the service for the given id
      const service = await suiClient.getObject({
        id: id!,
        options: { showContent: true },
      });
      const fields = (service.data?.content as { fields: any })?.fields || {};
      setService({
        id: id!,
        fee: fields.fee,
        ttl: fields.ttl,
        owner: fields.owner,
        name: fields.name,
      });
      setRecipientAllowlist(id!);

      // load all caps
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount?.address!,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::subscription::Cap`,
        },
      });

      // find the cap for the given service id
      const capId = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            service_id: fields?.service_id,
          };
        })
        .filter((item) => item.service_id === id)
        .map((item) => item.id) as string[];
      setCapId(capId[0]);
    }

    // Call getService immediately
    getService();

    // Set up interval to call getService every 3 seconds
    const intervalId = setInterval(() => {
      getService();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [id]); // Only depend on id since it's needed for the API calls

  return (
    <Card className="border border-[#393E46] bg-transparent p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-4">
        Admin View: Service {service?.name} (ID {service?.id && getObjectExplorerLink(service.id)})
      </h2>
      <h3 className="text-[#EEEEEE]/70 mb-6">
        Share{' '}
        <a
          href={`${window.location.origin}/subscription-example/view/service/${service?.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00ADB5] hover:text-[#00ADB5]/80 underline"
        >
          this link
        </a>{' '}
        with other users to subscribe to this service and access its files.
      </h3>

      <div className="space-y-4">
        <div className="border border-[#393E46] bg-[#222831]/50 p-4 rounded-md">
          <div className="space-y-3">
            <div>
              <p className="text-[#EEEEEE]/70 text-sm">Subscription duration</p>
              <p className="text-[#EEEEEE] font-medium">
                {service?.ttl ? service?.ttl / 60 / 1000 : 'null'} minutes
              </p>
            </div>
            <div>
              <p className="text-[#EEEEEE]/70 text-sm">Subscription fee</p>
              <p className="text-[#EEEEEE] font-medium">{service?.fee} MIST</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
