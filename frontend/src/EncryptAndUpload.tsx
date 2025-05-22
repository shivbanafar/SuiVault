// Redesigned EncryptAndUpload.tsx with modern UI
import React, { useState, useCallback, CSSProperties, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useNetworkVariable } from './networkConfig';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { fromHex, toHex, isValidSuiAddress } from '@mysten/sui/utils';
import { getAllowlistedKeyServers, SealClient, SessionKey, type SessionKeyType } from '@mysten/seal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileIcon, 
  UploadCloudIcon, 
  ShieldIcon, 
  CreditCardIcon,
  FileTextIcon,
  FileCheckIcon,
  FileSpreadsheetIcon,
  FileTypeIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LockIcon,
  EyeIcon,
  UserIcon,
  ShareIcon,
  UsersIcon,
  PlusIcon,
  Layers3Icon,
  X
} from 'lucide-react';
import { Spinner } from '@radix-ui/themes';
import { set, get } from 'idb-keyval';
import { useParams } from 'react-router-dom';
import { getObjectExplorerLink, downloadAndDecrypt, MoveCallConstructor } from './utils';

// File type interfaces
interface FileData {
  file: File;
  preview?: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'text' | 'archive' | 'code' | 'other';
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  isComplete: boolean;
  isError: boolean;
  errorMessage: string;
  blobId?: string;
}

interface AccessOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

interface WalrusUploadProps {
  policyObject: string;
  cap_id: string;
  moduleName: string;
  setRecipientAllowlist?: React.Dispatch<React.SetStateAction<string>>;
  setCapId?: React.Dispatch<React.SetStateAction<string>>;
  suiAddress: string;
}

export type Data = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: string;
};

type WalrusService = {
  id: string;
  name: string;
  publisherUrl: string;
  aggregatorUrl: string;
};

const customScrollbarStyles: CSSProperties = {
  '--scrollbar-width': '8px',
  '--scrollbar-track-bg': '#222831',
  '--scrollbar-thumb-bg': '#393E46',
  '--scrollbar-thumb-hover': '#00ADB5',
} as CSSProperties;

// Add supported file types constant
const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'text/plain': 'text',
  'text/csv': 'text',
  'text/html': 'code',
  'text/javascript': 'code',
  'application/javascript': 'code',
  'application/json': 'code',
  'application/xml': 'code',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
} as const;

// Add file type icons mapping
const FILE_TYPE_ICONS = {
  pdf: <FileTextIcon className="w-8 h-8 text-[#00ADB5]" />,
  excel: <FileSpreadsheetIcon className="w-8 h-8 text-[#00ADB5]" />,
  word: <FileTextIcon className="w-8 h-8 text-[#00ADB5]" />,
  image: <FileIcon className="w-8 h-8 text-[#00ADB5]" />,
  text: <FileTextIcon className="w-8 h-8 text-[#00ADB5]" />,
  archive: <FileIcon className="w-8 h-8 text-[#00ADB5]" />,
  code: <FileIcon className="w-8 h-8 text-[#00ADB5]" />,
  other: <FileTypeIcon className="w-8 h-8 text-[#00ADB5]" />,
} as const;

const WalrusUpload: React.FC<WalrusUploadProps> = ({ policyObject, cap_id, moduleName, setRecipientAllowlist, setCapId, suiAddress }) => {
  // States
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    isComplete: false,
    isError: false,
    errorMessage: '',
  });
  const [currentStep, setCurrentStep] = useState<'upload' | 'access' | 'confirmation'>('upload');
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState<string>('');
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [storageDuration, setStorageDuration] = useState<number>(1);
  const [info, setInfo] = useState<Data | null>(null);
  const [selectedService, setSelectedService] = useState<string>('service1');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Network configuration
  const packageId = useNetworkVariable('packageId');
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers('testnet'),
    verifyKeyServers: false,
  });

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

  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  // Access options
  const accessOptions: AccessOption[] = [
    {
      id: 'allowlist',
      name: 'Allowlist',
      description: 'Grant access to specific users by their wallet addresses',
      icon: <ShieldIcon className="w-6 h-6 text-[#00ADB5]" />
    },
    {
      id: 'subscription',
      name: 'Subscription',
      description: 'Users pay a fee to access your content for a specific time period',
      icon: <CreditCardIcon className="w-6 h-6 text-[#00ADB5]" />
    }
  ];

  // Subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Access',
      price: '5 SUI',
      description: 'Access for 7 days',
      features: ['File viewing', 'Download access', '7-day access period'],
      icon: <CreditCardIcon className="w-6 h-6 text-[#00ADB5]" />
    },
    {
      id: 'premium',
      name: 'Premium Access',
      price: '20 SUI',
      description: 'Access for 30 days',
      features: ['File viewing', 'Download access', 'Editing capabilities', '30-day access period'],
      icon: <CreditCardIcon className="w-6 h-6 text-[#00ADB5]" />
    }
  ];

  // Get file type icon
  const getFileTypeIcon = (type: FileData['type']) => {
    return FILE_TYPE_ICONS[type] || FILE_TYPE_ICONS.other;
  };

  // Get file size in appropriate units
  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add these constants and state variables in the component
  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;
  const NUM_EPOCH = 1;
  const TTL_MIN = 10;

  const services: WalrusService[] = [
    {
      id: 'service1',
      name: 'walrus.space',
      publisherUrl: '/publisher1',
      aggregatorUrl: '/aggregator1',
    },
    {
      id: 'service2',
      name: 'staketab.org',
      publisherUrl: '/publisher2',
      aggregatorUrl: '/aggregator2',
    },
    {
      id: 'service3',
      name: 'redundex.com',
      publisherUrl: '/publisher3',
      aggregatorUrl: '/aggregator3',
    },
    {
      id: 'service4',
      name: 'nodes.guru',
      publisherUrl: '/publisher4',
      aggregatorUrl: '/aggregator4',
    },
    {
      id: 'service5',
      name: 'banansen.dev',
      publisherUrl: '/publisher5',
      aggregatorUrl: '/aggregator5',
    },
    {
      id: 'service6',
      name: 'everstake.one',
      publisherUrl: '/publisher6',
      aggregatorUrl: '/aggregator6',
    },
  ];

  // Add these utility functions in the component
  function getAggregatorUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
    return `${service?.aggregatorUrl}/v1/${cleanPath}`;
  }

  function getPublisherUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
    return `${service?.publisherUrl}/v1/${cleanPath}`;
  }

  // Add new state variables for allowlist
  const [allowlist, setAllowlist] = useState<{id: string; name: string; list: string[];}>();
  const { id } = useParams();
  const currentAccount = useCurrentAccount();

  // Add useEffect for allowlist management
  useEffect(() => {
    async function getAllowlist() {
      if (!id || !currentAccount?.address) return;

      // Load all caps
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::allowlist::Cap`,
        },
      });

      // Find the cap for the given allowlist id
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

      if (setCapId) {
        setCapId(capId[0]);
      }

      // Load the allowlist
      const allowlistData = await suiClient.getObject({
        id: id,
        options: { showContent: true },
      });
      const fields = (allowlistData.data?.content as { fields: any })?.fields || {};
      setAllowlist({
        id: id,
        name: fields.name,
        list: fields.list,
      });
      if (setRecipientAllowlist) {
        setRecipientAllowlist(id);
      }
    }

    getAllowlist();
    const intervalId = setInterval(getAllowlist, 3000);
    return () => clearInterval(intervalId);
  }, [id, currentAccount?.address, packageId, suiClient, setCapId, setRecipientAllowlist]);

  // Add allowlist management functions
  const addRecipient = useCallback((address: string) => {
    if (!isValidSuiAddress(address.trim())) {
      setUploadState(prev => ({
        ...prev,
        isError: true,
        errorMessage: 'Invalid address'
      }));
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      arguments: [tx.object(id!), tx.object(cap_id), tx.pure.address(address.trim())],
      target: `${packageId}::allowlist::add`,
    });
    tx.setGasBudget(10000000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('Added recipient:', result);
          setNewRecipient('');
        },
      },
    );
  }, [id, cap_id, packageId, signAndExecute]);

  const removeRecipient = useCallback((address: string) => {
    const tx = new Transaction();
    tx.moveCall({
      arguments: [tx.object(id!), tx.object(cap_id), tx.pure.address(address.trim())],
      target: `${packageId}::allowlist::remove`,
    });
    tx.setGasBudget(10000000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('Removed recipient:', result);
        },
      },
    );
  }, [id, cap_id, packageId, signAndExecute]);

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Max 50 MiB size
    if (file.size > 50 * 1024 * 1024) {
      setUploadState({
        ...uploadState,
        isError: true,
        errorMessage: 'File size must be less than 50 MiB'
      });
      return;
    }

    const fileType = determineFileType(file);
    let preview = undefined;
    
    // Generate preview for images
    if (fileType === 'image') {
      preview = URL.createObjectURL(file);
    }
    
    setFileData({
      file,
      preview,
      type: fileType
    });
    
    setUploadState({
      isUploading: false,
      progress: 0,
      isComplete: false,
      isError: false,
      errorMessage: ''
    });
    setInfo(null);
  }, [uploadState]);

  // Handle file upload
  const handleUpload = useCallback(async () => {
    if (!fileData) return;
    
    setUploadState({
      ...uploadState,
      isUploading: true,
      progress: 0
    });
    
    try {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target && event.target.result) {
          const result = event.target.result;
          if (result instanceof ArrayBuffer) {
      // Generate nonce for encryption
      const nonce = crypto.getRandomValues(new Uint8Array(5));
      const policyObjectBytes = fromHex(policyObject);
      const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
      
      // Encrypt file
      const { encryptedObject: encryptedBytes } = await client.encrypt({
        threshold: 2,
        packageId,
        id,
              data: new Uint8Array(result),
      });
      
            // Store blob
            const storageInfo = await storeBlob(encryptedBytes);
            displayUpload(storageInfo.info, fileData.file.type);
      
      setUploadState({
        isUploading: false,
        progress: 100,
        isComplete: true,
        isError: false,
        errorMessage: '',
        blobId: id
      });
          }
        }
      };
      reader.readAsArrayBuffer(fileData.file);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadState({
        isUploading: false,
        progress: 0,
        isComplete: false,
        isError: true,
        errorMessage: 'Failed to encrypt and upload file'
      });
    }
  }, [fileData, uploadState, policyObject, packageId, client]);

  // Handle access selection
  const handleAccessSelection = (accessId: string) => {
    setSelectedAccess(accessId);
    if (accessId === 'subscription') {
      // Default to basic subscription
      setSelectedSubscription('basic');
    }
  };

  // Handle subscription selection
  const handleSubscriptionSelection = (planId: string) => {
    setSelectedSubscription(planId);
  };

  // Function to truncate wallet address
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Add recipient with validation
  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  // Remove recipient
  const handleRemoveRecipient = (address: string) => {
    setRecipients(recipients.filter(r => r !== address));
  };

  // Handle submit with storage duration
  const handleSubmit = async () => {
    if (!info?.blobId) return;

    setUploadState(prev => ({
      ...prev,
      isUploading: true
    }));

    try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${moduleName}::publish`,
        arguments: [
          tx.object(policyObject),
          tx.object(cap_id),
          tx.pure.string(info.blobId)
        ],
    });

    tx.setGasBudget(10000000);
      
      await signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('Transaction result:', result);
            alert('Blob attached successfully, now share the link or upload more.');
            setIsSuccessDialogOpen(true);
          setCurrentStep('confirmation');
            setUploadState(prev => ({
              ...prev,
              isUploading: false,
              isComplete: true
            }));
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setUploadState(prev => ({
              ...prev,
              isUploading: false,
              isError: true,
              errorMessage: 'Failed to publish the blob'
            }));
          }
      },
    );
    } catch (error) {
      console.error('Error:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        isError: true,
        errorMessage: 'Failed to complete the transaction'
      }));
    }
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(!viewMode);
  };

  // Determine file type
  const determineFileType = (file: File): FileData['type'] => {
    // Check for image files
    if (file.type.startsWith('image/')) return 'image';
    
    // Check for supported file types
    const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];
    if (fileType) return fileType;
    
    // Check file extension for additional types
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      switch (extension) {
        case 'txt':
        case 'csv':
        case 'md':
          return 'text';
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'py':
        case 'java':
        case 'cpp':
        case 'c':
        case 'h':
        case 'html':
        case 'css':
        case 'json':
        case 'xml':
          return 'code';
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
          return 'archive';
        default:
          return 'other';
      }
    }
    
    return 'other';
  };

  // Add these helper functions
  const displayUpload = (storage_info: any, media_type: any) => {
    let info;
    if ('alreadyCertified' in storage_info) {
      info = {
        status: 'Already certified',
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: 'Previous Sui Certified Event',
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: getAggregatorUrl(`/v1/blobs/${storage_info.alreadyCertified.blobId}`),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.alreadyCertified.event.txDigest}`,
        isImage: media_type.startsWith('image'),
      };
    } else if ('newlyCreated' in storage_info) {
      info = {
        status: 'Newly created',
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: 'Associated Sui Object',
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: getAggregatorUrl(`/v1/blobs/${storage_info.newlyCreated.blobObject.blobId}`),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.newlyCreated.blobObject.id}`,
        isImage: media_type.startsWith('image'),
      };
    } else {
      throw Error('Unhandled successful response!');
    }
    setInfo(info);
  };

  const storeBlob = (encryptedData: Uint8Array) => {
    return fetch(`${getPublisherUrl(`/v1/blobs?epochs=${NUM_EPOCH}`)}`, {
      method: 'PUT',
      body: encryptedData,
    }).then((response) => {
      if (response.status === 200) {
        return response.json().then((info) => {
          return { info };
        });
      } else {
        alert('Error publishing the blob on Walrus, please select a different Walrus service.');
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          isError: true,
          errorMessage: 'Error publishing the blob on Walrus, please select a different Walrus service.'
        }));
        throw new Error('Something went wrong when storing the blob!');
      }
    });
  };

  // Add this helper function
  function constructMoveCall(packageId: string, allowlistId: string): MoveCallConstructor {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${packageId}::allowlist::seal_approve`,
        arguments: [tx.pure.vector('u8', fromHex(id)), tx.object(allowlistId)],
      });
    };
  }

  // Update handleViewFiles function
  const handleViewFiles = async (blobIds: string[], allowlistId: string) => {
    try {
      const imported: SessionKeyType = await get('sessionKey');
      let sessionKey;

      if (imported) {
        try {
          sessionKey = await SessionKey.import(imported, {});
          if (!sessionKey.isExpired() && sessionKey.getAddress() === suiAddress) {
            const moveCallConstructor = constructMoveCall(packageId, allowlistId);
            await downloadAndDecrypt(
              blobIds,
              sessionKey,
              suiClient,
              client,
              moveCallConstructor,
              (error: string | null) => {
                if (error) {
                  setUploadState(prev => ({
                    ...prev,
                    isError: true,
                    errorMessage: error
                  }));
                }
              },
              setDecryptedFileUrls,
              setIsDialogOpen,
              setReloadKey,
            );
            return;
          }
        } catch (error) {
          console.log('Session key expired or invalid, creating new one');
        }
      }

      // Create new session key if none exists or current one is expired
      await set('sessionKey', null);
      sessionKey = new SessionKey({
        address: suiAddress,
        packageId,
        ttlMin: TTL_MIN,
      });

      signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result: { signature: string; }) => {
            try {
              await sessionKey.setPersonalMessageSignature(result.signature);
              const moveCallConstructor = constructMoveCall(packageId, allowlistId);
              await downloadAndDecrypt(
                blobIds,
                sessionKey,
                suiClient,
                client,
                moveCallConstructor,
                (error: string | null) => {
                  if (error) {
                    setUploadState(prev => ({
                      ...prev,
                      isError: true,
                      errorMessage: error
                    }));
                  }
                },
                setDecryptedFileUrls,
                setIsDialogOpen,
                setReloadKey,
              );
              await set('sessionKey', sessionKey.export());
            } catch (error: any) {
              console.error('Error in decryption:', error);
              setUploadState(prev => ({
                ...prev,
                isError: true,
                errorMessage: error.message || 'Failed to decrypt files'
              }));
            }
          },
        },
      );
    } catch (error: any) {
      console.error('Error:', error);
      setUploadState(prev => ({
        ...prev,
        isError: true,
        errorMessage: error.message || 'Failed to handle session key'
      }));
    }
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6 bg-[#222831]/80 rounded-lg border border-[#393E46] p-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#00ADB5]/20 p-3 rounded-lg">
          <UploadCloudIcon className="w-6 h-6 text-[#00ADB5]" />
      </div>
        <div>
          <h3 className="text-lg font-medium text-[#EEEEEE]">Upload Encrypted Files</h3>
          <p className="text-[#EEEEEE]/70 text-sm mt-1">Secure your files with blockchain-based encryption</p>
          </div>
        </div>

      <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46]">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[#EEEEEE]">Select Walrus service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-[#222831] border border-[#393E46] rounded-lg px-4 py-2 text-[#EEEEEE] focus:outline-none focus:border-[#00ADB5]"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

      {!fileData ? (
        <div 
            className="relative group cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <div className="border-2 border-dashed border-[#393E46] rounded-xl p-12 transition-all duration-300 group-hover:border-[#00ADB5] bg-[#222831]/50 backdrop-blur-sm">
          <input
            type="file"
                id="fileInput"
            className="hidden"
            onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.html,.css,.json,.xml,.zip,.rar,.7z,.tar,.gz,image/*"
              />
              <div className="relative z-10">
                <div className="bg-[#00ADB5]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#00ADB5]/20 transition-all duration-300">
                  <UploadCloudIcon className="w-10 h-10 text-[#00ADB5]" />
                </div>
                <p className="text-[#EEEEEE] text-xl mb-3 font-medium">Drop your file here, or <span className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition-colors">browse</span></p>
                <p className="text-[#EEEEEE]/70 text-sm mb-8">
                  Supported files: PDF, Word, Excel, Images, Text, Code files, Archives (up to 50MB)
                </p>
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00ADB5]/0 via-[#00ADB5]/20 to-[#00ADB5]/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        </div>
      ) : (
          <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46] relative group hover:border-[#00ADB5] transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="bg-[#393E46]/50 w-20 h-20 rounded-xl flex items-center justify-center p-4">
            {fileData.preview ? (
                  <img src={fileData.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
                  getFileTypeIcon(fileData.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#EEEEEE] font-medium text-lg mb-2 truncate">{fileData.file.name}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-[#00ADB5]/20 px-3 py-1.5 rounded-lg text-[#00ADB5] text-sm font-medium">
                    {getFileSize(fileData.file.size)}
                  </span>
                  <span className="text-[#EEEEEE]/30">•</span>
                  <span className="text-[#EEEEEE]/70 text-sm capitalize">{fileData.type} file</span>
                  {uploadState.isUploading && (
                    <>
                      <span className="text-[#EEEEEE]/30">•</span>
                      <span className="text-[#00ADB5] text-sm font-medium">Uploading...</span>
                    </>
                  )}
                </div>
              </div>
                <button 
                  onClick={() => setFileData(null)}
                className="text-[#EEEEEE]/70 hover:text-[#00ADB5] p-2.5 rounded-lg hover:bg-[#393E46]/30 transition-all duration-300"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
          </div>
          
          {uploadState.isUploading && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#393E46]/30 rounded-b-xl overflow-hidden">
                <div className="h-full bg-[#00ADB5] transition-all duration-300 animate-pulse" />
              </div>
            )}
            </div>
          )}
      </div>
          
      {uploadState.isError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-red-500/20 p-2.5 rounded-lg">
            <AlertCircleIcon className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-red-500 font-medium">{uploadState.errorMessage}</p>
            </div>
          )}

      {info && (
        <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46]">
          <h4 className="text-[#EEEEEE] font-medium mb-4 flex items-center gap-2">
            <FileCheckIcon className="w-5 h-5 text-[#00ADB5]" />
            Upload Details
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Status:</span>
              <span className="text-[#EEEEEE]">{info.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Blob ID:</span>
              <a
                href={info.blobUrl}
                className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Encrypted Blob
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Sui Reference:</span>
              <a
                href={info.suiUrl}
                className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      )}

      {fileData && !uploadState.isError && !uploadState.isComplete && (
        <button
          onClick={handleUpload}
          disabled={uploadState.isUploading}
          className="w-full bg-[#00ADB5] text-[#222831] py-4 px-6 rounded-xl hover:bg-[#00ADB5]/90 transition-all duration-300 flex items-center justify-center gap-3 font-medium text-base shadow-lg shadow-[#00ADB5]/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadState.isUploading ? (
            <>
              <Spinner className="w-5 h-5" />
              Uploading to Walrus...
            </>
          ) : (
            <>
              <LockIcon className="w-5 h-5" />
              First Step: Encrypt and Upload
            </>
          )}
        </button>
      )}
      
      {info && !uploadState.isError && (
        <button
          onClick={() => setCurrentStep('access')}
          className="w-full bg-[#00ADB5] text-[#222831] py-4 px-6 rounded-xl hover:bg-[#00ADB5]/90 transition-all duration-300 flex items-center justify-center gap-3 font-medium text-base shadow-lg shadow-[#00ADB5]/10"
        >
          <ShieldIcon className="w-5 h-5" />
          Second Step: Configure Access
        </button>
      )}
    </div>
  );

  // Render access step
  const renderAccessStep = () => (
    <div className="space-y-6 bg-[#222831]/80 rounded-lg border border-[#393E46] p-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#00ADB5]/20 p-3 rounded-lg">
          <ShieldIcon className="w-6 h-6 text-[#00ADB5]" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#EEEEEE]">Set Access Control</h3>
          <p className="text-[#EEEEEE]/70 text-sm mt-1">Choose who can access your encrypted files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accessOptions.map((option) => (
          <div 
            key={option.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedAccess === option.id 
                ? 'border-[#00ADB5] bg-[#00ADB5]/10'
                : 'border-[#393E46] bg-[#222831] hover:border-[#00ADB5]/50'
            }`}
            onClick={() => handleAccessSelection(option.id)}
          >
            <div className="flex items-start gap-3">
              {option.icon}
              <div>
                <h4 className="text-[#EEEEEE] font-medium mb-1">{option.name}</h4>
                <p className="text-[#EEEEEE]/70 text-sm">{option.description}</p>
            </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAccess === 'allowlist' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-[#00ADB5]" />
            <h4 className="text-[#EEEEEE] font-medium">Add Recipients</h4>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Enter wallet address"
              className="flex-1 bg-[#222831] border border-[#393E46] rounded-lg px-4 py-2 text-[#EEEEEE] placeholder-[#EEEEEE]/50 focus:outline-none focus:border-[#00ADB5] text-sm"
            />
            <button
              onClick={() => addRecipient(newRecipient)}
              className="bg-[#00ADB5] text-[#222831] px-4 py-2 rounded-lg hover:bg-[#00ADB5]/80 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Add
            </button>
          </div>
          
          {allowlist?.list && allowlist.list.length > 0 && (
            <div 
              className="space-y-2 max-h-[240px] overflow-y-auto pr-2" 
              style={{
                ...customScrollbarStyles,
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-thumb-bg) var(--scrollbar-track-bg)',
                overflowX: 'hidden'
              }}
            >
              {allowlist.list.map((recipient) => (
                <div
                  key={recipient}
                  className="flex items-center justify-between bg-[#222831] border border-[#393E46] rounded-lg p-3 group hover:border-[#00ADB5] transition-all duration-300"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="bg-[#00ADB5]/10 p-1.5 rounded-lg flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-[#00ADB5]" />
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-[#EEEEEE] text-sm font-medium break-all" title={recipient}>
                        {recipient}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeRecipient(recipient)}
                    className="text-[#EEEEEE]/70 hover:text-[#00ADB5] p-1.5 rounded-lg hover:bg-[#393E46]/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedAccess === 'subscription' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-[#00ADB5]" />
            <h4 className="text-[#EEEEEE] font-medium">Select Subscription Plan</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSubscription === plan.id 
                    ? 'border-[#00ADB5] bg-[#00ADB5]/10'
                    : 'border-[#393E46] bg-[#222831] hover:border-[#00ADB5]/50'
                }`}
                onClick={() => handleSubscriptionSelection(plan.id)}
              >
                <div className="flex items-start gap-3">
                    {plan.icon}
                  <div>
                    <h4 className="text-[#EEEEEE] font-medium">{plan.name}</h4>
                    <p className="text-[#00ADB5] font-medium mt-1">{plan.price}</p>
                    <p className="text-[#EEEEEE]/70 text-sm mt-1">{plan.description}</p>
                    <ul className="mt-3 space-y-2">
                  {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-[#EEEEEE]/70">
                          <CheckCircleIcon className="w-4 h-4 text-[#00ADB5]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('upload')}
          className="px-4 py-2 text-[#EEEEEE] hover:text-[#00ADB5] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <button
          onClick={() => setCurrentStep('confirmation')}
          disabled={!selectedAccess || (selectedAccess === 'allowlist' && !allowlist?.list?.length)}
          className="bg-[#00ADB5] text-[#222831] px-6 py-3 rounded-xl hover:bg-[#00ADB5]/90 transition-all duration-300 flex items-center gap-3 font-medium shadow-lg shadow-[#00ADB5]/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="space-y-6 bg-[#222831]/80 rounded-lg border border-[#393E46] p-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#00ADB5]/20 p-3 rounded-lg">
          <FileCheckIcon className="w-6 h-6 text-[#00ADB5]" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#EEEEEE]">Upload Complete</h3>
          <p className="text-[#EEEEEE]/70 text-sm mt-1">Your file has been encrypted and published successfully</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46]">
          <div className="flex items-center gap-6">
            <div className="bg-[#393E46]/50 w-20 h-20 rounded-xl flex items-center justify-center p-4">
              {fileData?.preview ? (
                <img src={fileData.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                getFileTypeIcon(fileData?.type || 'other')
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#EEEEEE] font-medium text-lg mb-2 truncate">{fileData?.file.name}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-[#00ADB5]/20 px-3 py-1.5 rounded-lg text-[#00ADB5] text-sm font-medium">
                  {getFileSize(fileData?.file.size || 0)}
                </span>
                <span className="text-[#EEEEEE]/30">•</span>
                <span className="text-[#EEEEEE]/70 text-sm capitalize">{fileData?.type} file</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46]">
          <h4 className="text-[#EEEEEE] font-medium mb-4 flex items-center gap-2">
            <FileCheckIcon className="w-5 h-5 text-[#00ADB5]" />
            Upload Details
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Status:</span>
              <span className="text-[#EEEEEE]">{info?.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Blob ID:</span>
              <a
                href={info?.blobUrl}
                className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Encrypted Blob
              </a>
      </div>
            <div className="flex justify-between items-center">
              <span className="text-[#EEEEEE]/70">Sui Reference:</span>
              <a
                href={info?.suiUrl}
                className="text-[#00ADB5] hover:text-[#00ADB5]/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>

        {decryptedFileUrls.length > 0 && (
          <div className="bg-[#222831]/50 backdrop-blur-sm rounded-xl p-6 border border-[#393E46]">
            <h4 className="text-[#EEEEEE] font-medium mb-4 flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-[#00ADB5]" />
              Decrypted Files
            </h4>
            <div className="space-y-4">
              {decryptedFileUrls.map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img src={url} alt={`Decrypted file ${index + 1}`} className="w-full h-auto" />
          </div>
              ))}
          </div>
            </div>
          )}

        {/* Success dialog */}
        {isSuccessDialogOpen && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-green-500/20 p-2.5 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-green-500 font-medium">
              Blob attached successfully, now share the link or upload more.
            </p>
        </div>
        )}
      
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={uploadState.isUploading || !info?.blobId}
            className="px-6 py-3 bg-[#00ADB5] text-[#222831] rounded-xl hover:bg-[#00ADB5]/90 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg shadow-[#00ADB5]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadState.isUploading ? (
              <>
                <Spinner className="w-5 h-5" />
                Publishing...
              </>
            ) : (
              <>
                <UploadCloudIcon className="w-5 h-5" />
                Publish File
              </>
            )}
          </button>
          
          {uploadState.isComplete && (
            <>
        <button
          onClick={() => {
            setFileData(null);
            setUploadState({
              isUploading: false,
              progress: 0,
              isComplete: false,
              isError: false,
              errorMessage: ''
            });
                  setInfo(null);
                  setIsSuccessDialogOpen(false);
            setCurrentStep('upload');
          }}
                className="px-6 py-3 bg-[#393E46] text-[#EEEEEE] rounded-xl hover:bg-[#393E46]/90 transition-all duration-300 flex items-center gap-2 font-medium"
        >
                <UploadCloudIcon className="w-5 h-5" />
          Upload Another File
        </button>
            </>
          )}
        </div>

        {uploadState.isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-red-500/20 p-2.5 rounded-lg">
              <AlertCircleIcon className="w-5 h-5 text-red-500" />
      </div>
            <p className="text-red-500 font-medium">{uploadState.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render file viewer
  const renderFileViewer = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#222831] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[#393E46]">
        <div className="p-4 border-b border-[#393E46] flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2 text-[#EEEEEE]">
            {getFileTypeIcon(fileData?.type || 'other')}
            <span>{fileData?.file.name}</span>
          </h3>
          <button 
            onClick={toggleViewMode}
            className="text-[#EEEEEE]/70 hover:text-[#00ADB5] transition-colors"
          >
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-[#222831]">
          {fileData?.type === 'image' && fileData.preview ? (
            <div className="flex items-center justify-center h-full">
              <img src={fileData.preview} className="max-w-full max-h-full object-contain" alt="Preview" />
            </div>
          ) : fileData?.type === 'pdf' ? (
            <div className="bg-[#222831]/80 p-8 min-h-full border border-[#393E46] rounded-lg">
              <div className="text-center text-[#EEEEEE]/70">
                <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-[#00ADB5]" />
                <p>PDF Viewer would be integrated here</p>
              </div>
            </div>
          ) : fileData?.type === 'excel' ? (
            <div className="bg-[#222831]/80 p-8 min-h-full border border-[#393E46] rounded-lg">
              <div className="text-center text-[#EEEEEE]/70">
                <FileSpreadsheetIcon className="w-16 h-16 mx-auto mb-4 text-[#00ADB5]" />
                <p>Excel Viewer would be integrated here</p>
              </div>
            </div>
          ) : fileData?.type === 'word' ? (
            <div className="bg-[#222831]/80 p-8 min-h-full border border-[#393E46] rounded-lg">
              <div className="text-center text-[#EEEEEE]/70">
                <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-[#00ADB5]" />
                <p>Word Viewer would be integrated here</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#222831]/80 p-8 min-h-full border border-[#393E46] rounded-lg">
              <div className="text-center text-[#EEEEEE]/70">
                <FileIcon className="w-16 h-16 mx-auto mb-4 text-[#00ADB5]" />
                <p>No preview available for this file type</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#393E46] flex justify-end gap-2">
          <button className="px-4 py-2 border border-[#393E46] text-[#EEEEEE] rounded-lg hover:bg-[#393E46]/50 transition-colors text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button className="px-4 py-2 bg-[#00ADB5] text-[#222831] rounded-lg hover:bg-[#00ADB5]/80 transition-colors text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#222831]/80 rounded-lg border border-[#393E46] p-6">
      <AnimatePresence mode="wait">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'access' && renderAccessStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </AnimatePresence>
      
      {viewMode && renderFileViewer()}
    </div>
  );
};

export default WalrusUpload;