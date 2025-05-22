// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNetworkVariable } from "./networkConfig";
import { useEffect, useState } from "react";
import { X, PlusIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getObjectExplorerLink } from "./utils";

export interface Allowlist {
  id: string;
  name: string;
  list: string[];
}

interface AllowlistProps {
  setRecipientAllowlist: React.Dispatch<React.SetStateAction<string>>;
  setCapId: React.Dispatch<React.SetStateAction<string>>;
}

export function Allowlist({ setRecipientAllowlist, setCapId }: AllowlistProps) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [allowlist, setAllowlist] = useState<Allowlist>();
  const [capId, setLocalCapId] = useState<string>();
  const { id } = useParams();

  useEffect(() => {
    async function getAllowlist() {
      const allowlist = await suiClient.getObject({
        id: id!,
        options: { showContent: true },
      });
      const fields = (allowlist.data?.content as { fields: any })?.fields || {};
      setAllowlist({
        id: id!,
        name: fields.name,
        list: fields.list,
      });
      setRecipientAllowlist(id!);

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

      const capId = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            allowlist_id: fields?.allowlist_id,
          };
        })
        .filter((item) => item.allowlist_id === id)
        .map((item) => item.id) as string[];
      setLocalCapId(capId[0]);
      setCapId(capId[0]);
    }

    getAllowlist();

    const intervalId = setInterval(() => {
      getAllowlist();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [id]);

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

  const addItem = (newAddressToAdd: string, wl_id: string, cap_id: string) => {
    if (newAddressToAdd.trim() !== "") {
      if (!isValidSuiAddress(newAddressToAdd.trim())) {
        alert("Invalid address");
        return;
      }
      const tx = new Transaction();
      tx.moveCall({
        arguments: [
          tx.object(wl_id),
          tx.object(cap_id),
          tx.pure.address(newAddressToAdd.trim()),
        ],
        target: `${packageId}::allowlist::add`,
      });
      tx.setGasBudget(10000000);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("res", result);
          },
        }
      );
    }
  };

  const removeItem = (
    addressToRemove: string,
    wl_id: string,
    cap_id: string
  ) => {
    if (addressToRemove.trim() !== "") {
      const tx = new Transaction();
      tx.moveCall({
        arguments: [
          tx.object(wl_id),
          tx.object(cap_id),
          tx.pure.address(addressToRemove.trim()),
        ],
        target: `${packageId}::allowlist::remove`,
      });
      tx.setGasBudget(10000000);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("res", result);
          },
        }
      );
    }
  };

  return (
    <Card className="border border-[#393E46] bg-transparent p-6">
      <h2 className="text-[#EEEEEE] text-xl font-semibold mb-4">
        Admin View: Allowlist {allowlist?.name} (ID{" "}
        {allowlist?.id && getObjectExplorerLink(allowlist.id)})
      </h2>
      <h3 className="text-[#EEEEEE]/70 mb-6">
        Share{" "}
        <a
          href={`${window.location.origin}/allowlist-example/view/allowlist/${allowlist?.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00ADB5] hover:text-[#00ADB5]/80 underline"
        >
          this link
        </a>{" "}
        with users to access the files associated with this allowlist.
      </h3>

      <div className="space-y-6">
        <div className="flex gap-3">
          <input
            placeholder="Add new address"
            className="flex-1 bg-[#222831]/50 border-[#393E46] text-[#EEEEEE] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition-all"
          />
          <Button
            className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] px-4 py-2 rounded-md transition-all"
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              addItem(input.value, id!, capId!);
              input.value = "";
            }}
          >
            <PlusIcon className="w-5 h-5" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-[#EEEEEE] font-medium">Allowed Users:</h4>
          {Array.isArray(allowlist?.list) && allowlist?.list.length > 0 ? (
            <ul className="space-y-2">
              {allowlist?.list.map((listItem, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-center justify-between border border-[#393E46] bg-[#222831]/50 p-3 rounded-md"
                >
                  <p
                    className="text-[#EEEEEE] truncate max-w-[240px]"
                    title={listItem}
                  >
                    {listItem}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-[#393E46]/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(listItem, id!, capId!);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#EEEEEE]/70">No user in this allowlist.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
