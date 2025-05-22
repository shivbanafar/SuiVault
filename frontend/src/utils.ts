import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import React from 'react';

export type MoveCallConstructor = (tx: Transaction, id: string) => void;

export const downloadAndDecrypt = async (
  blobIds: string[],
  sessionKey: SessionKey,
  suiClient: SuiClient,
  sealClient: SealClient,
  moveCallConstructor: (tx: Transaction, id: string) => void,
  setError: (error: string | null) => void,
  setDecryptedFileUrls: (urls: string[]) => void,
  setIsDialogOpen: (open: boolean) => void,
  setReloadKey: (updater: (prev: number) => number) => void,
) => {
  const aggregators = ['aggregator1', 'aggregator2', 'aggregator3', 'aggregator4', 'aggregator5', 'aggregator6'];
  let failedAttempts = 0;
  
  // First, download all files in parallel (ignore errors)
  const downloadResults = await Promise.all(
    blobIds.map(async (blobId) => {
      for (const aggregator of aggregators) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const aggregatorUrl = `/${aggregator}/v1/blobs/${blobId}`;
          const response = await fetch(aggregatorUrl, { signal: controller.signal });
          clearTimeout(timeout);
          
          if (response.ok) {
            return await response.arrayBuffer();
          }
          failedAttempts++;
        } catch (err) {
          console.error(`Failed to retrieve blob ${blobId} from ${aggregator}:`, err);
          failedAttempts++;
        }
      }
      return null;
    }),
  );

  // Filter out failed downloads
  const validDownloads = downloadResults.filter((result): result is ArrayBuffer => result !== null);
  console.log('validDownloads count', validDownloads.length);

  if (validDownloads.length === 0) {
    let errorMsg = 'Unable to retrieve files. This could be because:';
    errorMsg += '\n1. The files were uploaded more than 1 epoch ago and have been automatically deleted';
    errorMsg += '\n2. There might be temporary connectivity issues with the Walrus network';
    errorMsg += '\n\nPlease try the following:';
    errorMsg += '\n- For recently uploaded files, try refreshing the page';
    errorMsg += '\n- For older files, they will need to be re-uploaded';
    
    console.error(errorMsg);
    setError(errorMsg);
    return;
  }

  // Fetch keys in batches of <=10
  for (let i = 0; i < validDownloads.length; i += 10) {
    const batch = validDownloads.slice(i, i + 10);
    const ids = batch.map((enc) => EncryptedObject.parse(new Uint8Array(enc)).id);
    const tx = new Transaction();
    ids.forEach((id) => moveCallConstructor(tx, id));
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
    try {
      await sealClient.fetchKeys({ ids, txBytes, sessionKey, threshold: 2 });
    } catch (err) {
      console.log(err);
      const errorMsg =
        err instanceof NoAccessError
          ? 'No access to decryption keys'
          : 'Unable to decrypt files, try again';
      console.error(errorMsg, err);
      setError(errorMsg);
      return;
    }
  }

  // Then, decrypt files sequentially
  const decryptedFileUrls: string[] = [];
  for (const encryptedData of validDownloads) {
    const fullId = EncryptedObject.parse(new Uint8Array(encryptedData)).id;
    const tx = new Transaction();
    moveCallConstructor(tx, fullId);
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
    try {
      // Note that all keys are fetched above, so this only local decryption is done
      const decryptedFile = await sealClient.decrypt({
        data: new Uint8Array(encryptedData),
        sessionKey,
        txBytes,
      });
      const blob = new Blob([decryptedFile], { type: 'image/jpg' });
      decryptedFileUrls.push(URL.createObjectURL(blob));
    } catch (err) {
      console.log(err);
      const errorMsg =
        err instanceof NoAccessError
          ? 'No access to decryption keys'
          : 'Unable to decrypt files, try again';
      console.error(errorMsg, err);
      setError(errorMsg);
      return;
    }
  }

  if (decryptedFileUrls.length > 0) {
    setDecryptedFileUrls(decryptedFileUrls);
    setIsDialogOpen(true);
    setReloadKey((prev) => prev + 1);
  }
};

export const getObjectExplorerLink = (id: string): React.ReactElement => {
  return React.createElement(
    'a',
    {
      href: `https://testnet.suivision.xyz/object/${id}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      style: { textDecoration: 'underline' },
    },
    id.slice(0, 10) + '...',
  );
};
