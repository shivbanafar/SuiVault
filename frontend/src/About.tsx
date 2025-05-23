import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { staggerContainer } from "@/lib/animations";
import { 
  ShieldIcon, 
  CreditCardIcon, 
  LockIcon, 
  FileIcon, 
  CodeIcon, 
  GlobeIcon,
  UsersIcon,
  KeyIcon,
  ServerIcon,
  ZapIcon,
  BarChartIcon,
  HeartIcon,
  XIcon
} from "lucide-react";
import { useState } from "react";

// Animation variants for modal
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export function About() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const features = [
    {
      id: "allowlist",
      icon: <ShieldIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "Allowlist Access Control",
      shortDescription: "Secure allowlist system for managing access to encrypted files",
      fullDescription: "Implemented a secure allowlist system where creators can manage access to their encrypted files by specifying authorized wallet addresses. Users must sign a personal message to verify their identity and gain access. The system ensures that only authorized users can access sensitive documents while maintaining complete control for document owners."
    },
    {
      id: "subscription",
      icon: <CreditCardIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "Subscription Service",
      shortDescription: "Flexible subscription-based access system with SUI token payments",
      fullDescription: "Created a subscription-based access system where creators can set up paid services with customizable time periods. Users can purchase access using SUI tokens, represented as NFTs on the blockchain. The system supports various subscription models and provides automatic renewal options for continuous access."
    },
    {
      id: "encryption",
      icon: <LockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "End-to-End Encryption",
      shortDescription: "Advanced threshold-based encryption for maximum security",
      fullDescription: "Implemented secure file encryption using a threshold-based system where key shares are distributed across multiple servers. Files are encrypted before storage and can only be decrypted by authorized users. The system uses state-of-the-art encryption algorithms and secure key management practices."
    },
    {
      id: "management",
      icon: <FileIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "File Management",
      shortDescription: "Comprehensive file management with secure storage",
      fullDescription: "Built a comprehensive file management system supporting various file types (PDFs, images, documents) with secure upload, storage, and download capabilities. Files are stored on the Sui blockchain with proper access controls, versioning, and metadata management."
    },
    {
      id: "smart-contracts",
      icon: <CodeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "Smart Contract Integration",
      shortDescription: "Advanced blockchain integration with custom smart contracts",
      fullDescription: "Developed and integrated smart contracts for managing allowlists and subscriptions on the Sui blockchain. Implemented proper access control mechanisms and transaction handling. The contracts are optimized for gas efficiency and include comprehensive security measures."
    },
    {
      id: "interface",
      icon: <GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "Modern Web Interface",
      shortDescription: "User-friendly interface with modern design principles",
      fullDescription: "Created a responsive and user-friendly web interface using React, TypeScript, and modern UI components. Implemented smooth animations and transitions for better user experience. The interface is designed to be intuitive and accessible to users of all technical levels."
    },
    {
      id: "security",
      icon: <KeyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "Advanced Security",
      shortDescription: "Multi-layered security with blockchain protection",
      fullDescription: "Multiple layers of security including blockchain-based access control, threshold encryption, and secure key management. The system implements industry best practices for security and regularly undergoes security audits to ensure the highest level of protection."
    },
    {
      id: "performance",
      icon: <ZapIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00ADB5] stroke-[1.75] transition-all duration-200" />,
      title: "High Performance",
      shortDescription: "Optimized for speed and efficiency",
      fullDescription: "Optimized for speed with efficient smart contracts, quick file encryption/decryption, and responsive UI interactions. The system is designed to handle high loads while maintaining performance and reliability."
    }
  ];

  return (
    <div className="relative min-h-screen">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-8 max-w-[1920px] mx-auto"
      >
        {/* Hero Section */}
        <Card className="border border-[#393E46] bg-[#222831]/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/10 via-[#00ADB5]/5 to-transparent" />
          <div className="relative">
            <CardHeader className="text-center py-6 px-8">
              <CardTitle className="text-[#EEEEEE] text-4xl font-bold mb-4">About SuiVault</CardTitle>
              <CardDescription className="text-[#EEEEEE]/70 text-lg max-w-3xl mx-auto">
                A revolutionary decentralized document management platform built on Sui blockchain that transforms how we handle sensitive documents.
              </CardDescription>
            </CardHeader>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className="cursor-pointer"
              onClick={() => setSelectedCard(feature.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full border border-[#393E46] bg-[#222831]/80 transition-all duration-200 group-hover:bg-gradient-to-br from-[#00ADB5]/10 via-[#00ADB5]/5 to-transparent">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-5">
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br from-[#00ADB5]/10 via-[#00ADB5]/5 to-transparent transition-all duration-200"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <div className="space-y-2">
                      <CardTitle className="text-[#EEEEEE] text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-[#EEEEEE]/70 text-base">
                        {feature.shortDescription}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedCard(null)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-8"
              onClick={() => setSelectedCard(null)}
            >
              <Card 
                className="max-w-3xl w-full border border-[#393E46] bg-[#222831] relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-6 right-6 text-[#EEEEEE]/70 hover:text-[#EEEEEE] transition-colors"
                >
                  <XIcon className="w-7 h-7" />
                </button>
                <CardHeader className="p-6">
                  <div className="flex items-start gap-6 pr-12">
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gradient-to-br from-[#00ADB5]/10 via-[#00ADB5]/5 to-transparent transition-all duration-200"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {features.find(f => f.id === selectedCard)?.icon}
                    </motion.div>
                    <div className="space-y-3">
                      <CardTitle className="text-[#EEEEEE] text-3xl">
                        {features.find(f => f.id === selectedCard)?.title}
                      </CardTitle>
                      <CardDescription className="text-[#EEEEEE]/70 text-lg">
                        {features.find(f => f.id === selectedCard)?.shortDescription}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-[#EEEEEE]/70 text-lg leading-relaxed">
                    {features.find(f => f.id === selectedCard)?.fullDescription}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 