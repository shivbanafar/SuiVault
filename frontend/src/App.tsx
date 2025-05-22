import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockIcon,
  FileIcon,
  UploadCloudIcon,
  ShieldIcon,
  CreditCardIcon,
  HomeIcon,
  ListIcon,
  FileTextIcon,
  FileCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  Layers3Icon,
  EyeIcon,
  MessageCircle,
  InfoIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { CreateAllowlist } from "./CreateAllowlist";
import { Allowlist } from "./Allowlist";
import WalrusUpload from "./EncryptAndUpload";
import { CreateService } from "./CreateSubscriptionService";
import FeedsToSubscribe from "./SubscriptionView";
import { Service } from "./SubscriptionService";
import { AllAllowlist } from "./OwnedAllowlists";
import { AllServices } from "./OwnedSubscriptionServices";
import Feeds from "./AllowlistView";
import { Chat } from "@/components/Chat";
import { pageTransition, cardHover, staggerContainer, staggerItem, fadeIn, iconHover, buttonHover, arrowHover, navItemAnimation, logoAnimation, fileTypeCardAnimation } from "@/lib/animations";
import { About } from "./About";

function SealLogo() {
  return (
    <motion.div
      variants={logoAnimation}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="flex items-center gap-3"
    >
      <motion.div
        variants={iconHover}
        whileHover="hover"
      >
        <LockIcon className="w-8 h-8 text-[#00ADB5]" />
      </motion.div>
      <span className="font-bold text-2xl text-[#EEEEEE]">SuiVault</span>
    </motion.div>
  );
}

interface InfoAlertProps {
  message: string;
}

function InfoAlert({ message }: InfoAlertProps) {
  return (
    <motion.div
      className="mb-4 p-4 bg-[#222831]/80 border-l-4 border-[#00ADB5] rounded shadow-sm"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <AlertCircleIcon className="w-5 h-5 text-[#00ADB5] mr-2 mt-0.5" />
        <p className="text-sm text-[#EEEEEE]">{message}</p>
      </div>
    </motion.div>
  );
}

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (location.pathname.includes("allowlist-example")) {
      setActiveTab("allowlist");
    } else if (location.pathname.includes("subscription-example")) {
      setActiveTab("subscription");
    } else if (location.pathname.includes("chat")) {
      setActiveTab("chat");
    } else if (location.pathname.includes("about")) {
      setActiveTab("about");
    } else {
      setActiveTab("home");
    }
  }, [location]);

  return (
    <div className="bg-[#222831] border-b border-[#393E46] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center h-20">
          {/* Logo on extreme left */}
          <div className="flex-shrink-0 mr-12">
            <SealLogo />
          </div>
          
          {/* Navigation tabs in center */}
          <nav className="flex flex-1 items-center justify-center space-x-2">
            {[
              { path: "/", icon: HomeIcon, label: "Home" },
              { path: "/allowlist-example", icon: ShieldIcon, label: "Allowlist" },
              { path: "/subscription-example", icon: CreditCardIcon, label: "Subscription" },
              { path: "/chat", icon: MessageCircle, label: "Assistant" },
              { path: "/about", icon: InfoIcon, label: "About" }
            ].map((item) => (
              <motion.div
                key={item.path}
                variants={navItemAnimation}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center px-6 py-2 rounded-none border-b-2 transition-all duration-300 h-20 text-base ${
                    activeTab === item.label.toLowerCase()
                      ? "font-bold border-[#00ADB5] text-[#00ADB5] bg-[#393E46]"
                      : "font-normal border-transparent text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#393E46]/50"
                  }`}
                >
                  <motion.div
                    variants={iconHover}
                    whileHover="hover"
                  >
                    <item.icon
                      className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                        activeTab === item.label.toLowerCase()
                          ? "fill-[#00ADB5] stroke-[#00ADB5]"
                          : "stroke-[#EEEEEE]"
                      }`}
                      fill={activeTab === item.label.toLowerCase() ? "currentColor" : "none"}
                    />
                  </motion.div>
                  <span>{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </nav>

          {/* ConnectButton on extreme right */}
          <div className="flex-shrink-0 ml-12">
            <motion.div
              variants={buttonHover}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <ConnectButton />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  linkTo: string;
}

function FeatureCard({ icon, title, description, buttonText, linkTo }: FeatureCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border border-[#393E46] bg-[#222831]/80">
        <CardHeader>
          <motion.div 
            variants={iconHover}
            whileHover="hover"
            className="w-12 h-12 rounded-full bg-[#00ADB5]/20 flex items-center justify-center mb-4"
          >
            {icon}
          </motion.div>
          <CardTitle className="text-[#EEEEEE]">{title}</CardTitle>
          <CardDescription className="text-[#EEEEEE]/70">{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to={linkTo} className="w-full">
            <motion.div
              variants={buttonHover}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="w-full"
            >
              <Button className="w-full flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] group">
                {buttonText}
                <motion.svg
                  variants={arrowHover}
                  whileHover="hover"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </motion.svg>
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function FileTypeSupport() {
  return (
    <div className="bg-[#222831]/80 text-[#EEEEEE] p-4 rounded-lg mb-6 border border-[#393E46]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem} className="flex items-center gap-2 mb-3">
          <motion.div
            variants={iconHover}
            whileHover="hover"
          >
            <FileTextIcon className="w-5 h-5 text-[#00ADB5]" />
          </motion.div>
          <h3 className="text-lg font-medium text-[#EEEEEE]">Supported File Types</h3>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {['Images', 'PDFs', 'Excel', 'Word'].map((type, index) => (
            <motion.div
              key={type}
              variants={fileTypeCardAnimation}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="bg-[#222831] text-[#EEEEEE] p-3 rounded border border-[#393E46] flex items-center gap-2 cursor-pointer"
            >
              <motion.div
                variants={iconHover}
                whileHover="hover"
              >
                <FileIcon className="w-5 h-5 text-[#00ADB5]" />
              </motion.div>
              <span>{type}</span>
              <motion.div
                variants={iconHover}
                whileHover="hover"
              >
                <CheckCircleIcon className="w-4 h-4 text-[#00ADB5] ml-auto" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function LandingPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-gradient-to-r from-[#00ADB5]/10 to-[#00ADB5]/20 border-[#393E46]">
          <CardHeader className="pb-6">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={staggerItem}>
                <CardTitle className="text-3xl md:text-4xl text-[#EEEEEE]">
                  Secure File Sharing with Blockchain Protection
                </CardTitle>
              </motion.div>
              <motion.div variants={staggerItem}>
                <CardDescription className="text-lg text-[#EEEEEE]/70 mt-3">
                  Upload, encrypt, and share your files with granular access control
                  using SUI blockchain technology. Choose between allowlist-based or
                  subscription-based sharing models.
                </CardDescription>
              </motion.div>
            </motion.div>
          </CardHeader>
          <CardContent className="pb-6">
            <motion.div 
              className="flex flex-wrap gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={staggerItem}>
                <Link to="/allowlist-example">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button size="lg" className="flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831] group">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ShieldIcon
                          className={`w-5 h-5`}
                        />
                      </motion.div>
                      Start with Allowlist
                      <motion.svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </motion.svg>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div variants={staggerItem}>
                <Link to="/subscription-example">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex items-center gap-2 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-[#222831] group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CreditCardIcon
                          className={`w-5 h-5`}
                        />
                      </motion.div>
                      Try Subscription Model
                      <motion.svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </motion.svg>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* File Type Support Section */}
      <Card className="border-[#393E46] bg-[#222831]/80">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ADB5]/10 p-2 rounded-lg">
              <FileTextIcon className="w-5 h-5 text-[#00ADB5]" />
            </div>
            <CardTitle className="text-[#EEEEEE]">Supported File Types</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#222831] text-[#EEEEEE] p-4 rounded-lg border border-[#393E46] flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-[#00ADB5]" />
              <span>Images</span>
              <CheckCircleIcon className="w-4 h-4 text-[#00ADB5] ml-auto" />
            </div>
            <div className="bg-[#222831] p-4 text-[#EEEEEE] rounded-lg border border-[#393E46] flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-[#00ADB5]" />
              <span>PDFs</span>
              <CheckCircleIcon className="w-4 h-4 text-[#00ADB5] ml-auto" />
            </div>
            <div className="bg-[#222831] p-4 rounded-lg border border-[#393E46] flex items-center gap-3 text-[#EEEEEE]">
              <FileIcon className="w-5 h-5 text-[#00ADB5]" />
              <span>Excel</span>
              <CheckCircleIcon className="w-4 h-4 text-[#00ADB5] ml-auto" />
            </div>
            <div className="bg-[#222831] p-4 rounded-lg border border-[#393E46] flex items-center gap-3 text-[#EEEEEE]">
              <FileIcon className="w-5 h-5 text-[#00ADB5]" />
              <span>Word</span>
              <CheckCircleIcon className="w-4 h-4 text-[#00ADB5] ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[#393E46] bg-[#222831]/80 hover:bg-[#222831] transition-colors">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#00ADB5]/10 p-3 rounded-lg">
                <ShieldIcon className="w-6 h-6 text-[#00ADB5]" />
              </div>
              <div>
                <CardTitle className="text-[#EEEEEE]">Allowlist Access Control</CardTitle>
                <CardDescription className="text-[#EEEEEE]/70 mt-2">
                  Define specific users who can access your encrypted files. Add or remove addresses anytime with full control.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter>
            <Link to="/allowlist-example" className="w-full">
              <Button className="w-full flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831]">
                Try Allowlist
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-[#393E46] bg-[#222831]/80 hover:bg-[#222831] transition-colors">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#00ADB5]/10 p-3 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-[#00ADB5]" />
              </div>
              <div>
                <CardTitle className="text-[#EEEEEE]">Subscription Based Access</CardTitle>
                <CardDescription className="text-[#EEEEEE]/70 mt-2">
                  Create a subscription service where users pay to access your content for a specific time period.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter>
            <Link to="/subscription-example" className="w-full">
              <Button className="w-full flex items-center gap-2 bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#222831]">
                Try Subscription
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Important Information Section */}
      <Card className="border-[#393E46] bg-[#393E46]/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ADB5]/20 p-2.5 rounded-lg">
              <AlertCircleIcon className="w-5 h-5 text-[#00ADB5]" />
            </div>
            <CardTitle className="text-[#EEEEEE]">Important Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-[#00ADB5]/20 text-[#00ADB5] w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 text-sm font-bold">
                1
              </div>
              <div className="text-[#EEEEEE] space-y-1">
                <p>
                  This is a Testnet demo. Connect your wallet to Testnet and
                  request balance from{" "}
                  <a
                    href="https://faucet.sui.io/"
                    className="text-[#00ADB5] underline hover:text-[#00ADB5]/80 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    faucet.sui.io
                  </a>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00ADB5]/20 text-[#00ADB5] w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 text-sm font-bold">
                2
              </div>
              <div className="text-[#EEEEEE] space-y-1">
                <p>Files are stored on Walrus Testnet for just 1 epoch by default.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00ADB5]/20 text-[#00ADB5] w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 text-sm font-bold">
                3
              </div>
              <div className="text-[#EEEEEE] space-y-1">
                <p>
                  The source code is available on GitHub.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
}

function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={staggerItem}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const currentAccount = useCurrentAccount();
  const [recipientAllowlist, setRecipientAllowlist] = useState<string>("");
  const [capId, setCapId] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#222831]">
      <BrowserRouter>
        <NavBar />
        <div className="container py-12 max-w-6xl mx-auto px-6">
          {currentAccount ? (
            <PageTransition>
              <Routes>
                <Route path="/" element={
                  <motion.div
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <LandingPage />
                  </motion.div>
                } />
                <Route path="/about" element={
                  <motion.div
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <About />
                  </motion.div>
                } />
                <Route path="/chat" element={
                  <motion.div
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="border border-[#393E46] bg-transparent">
                      <CardHeader>
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={staggerItem}>
                            <CardTitle className="text-[#EEEEEE]">SuiVault Assistant</CardTitle>
                          </motion.div>
                          <motion.div variants={staggerItem}>
                            <CardDescription className="text-[#EEEEEE]/70">
                              Get help with SuiVault features, security, and best practices.
                            </CardDescription>
                          </motion.div>
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <Chat />
                      </CardContent>
                    </Card>
                  </motion.div>
                } />
                <Route
                  path="/allowlist-example/*"
                  element={
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <motion.div
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <Card className="border border-[#393E46] bg-transparent">
                              <CardHeader>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <motion.div variants={staggerItem}>
                                    <CardTitle className="text-[#EEEEEE]">Allowlist Access Control</CardTitle>
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <CardDescription className="text-[#EEEEEE]/70">
                                      Create an allowlist and specify which addresses can access your encrypted files.
                                    </CardDescription>
                                  </motion.div>
                                </motion.div>
                              </CardHeader>
                              <CardContent>
                                <motion.div variants={staggerItem}>
                                  <InfoAlert message="Create an allowlist below, then add addresses that should have access to your encrypted files." />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                  <CreateAllowlist />
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        }
                      />
                      <Route
                        path="/admin/allowlist/:id"
                        element={
                          <motion.div
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <Card className="border border-[#393E46] bg-transparent">
                              <CardHeader>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <motion.div variants={staggerItem}>
                                    <CardTitle className="text-[#EEEEEE]">Manage Allowlist</CardTitle>
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <CardDescription className="text-[#EEEEEE]/70">
                                      Add or remove addresses from your allowlist and upload encrypted files.
                                    </CardDescription>
                                  </motion.div>
                                </motion.div>
                              </CardHeader>
                              <CardContent>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                                >
                                  <motion.div variants={staggerItem}>
                                    <InfoAlert message="First add addresses to your allowlist, then upload and encrypt files that only these addresses can access." />
                                    <Allowlist
                                      setRecipientAllowlist={setRecipientAllowlist}
                                      setCapId={setCapId}
                                    />
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <div className="bg-[#222831]/80 p-6 rounded-lg border border-[#393E46]">
                                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-4 flex items-center gap-2">
                                        <UploadCloudIcon className="w-5 h-5 text-[#00ADB5]" />
                                        Upload Encrypted Files
                                      </h3>
                                      <WalrusUpload
                                        policyObject={recipientAllowlist}
                                        cap_id={capId}
                                        moduleName="allowlist"
                                      />
                                    </div>
                                  </motion.div>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        }
                      />
                      <Route path="/admin/allowlists" element={
                        <motion.div
                          variants={pageTransition}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <AllAllowlist />
                        </motion.div>
                      } />
                      <Route path="/view/allowlist/:id" element={
                        <motion.div
                          variants={pageTransition}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Feeds suiAddress={currentAccount.address} />
                        </motion.div>
                      } />
                    </Routes>
                  }
                />
                <Route
                  path="/subscription-example/*"
                  element={
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <motion.div
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <Card className="border border-[#393E46] bg-transparent">
                              <CardHeader>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <motion.div variants={staggerItem}>
                                    <CardTitle className="text-[#EEEEEE]">Subscription Services</CardTitle>
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <CardDescription className="text-[#EEEEEE]/70">
                                      Create a subscription service where users pay to access your encrypted files for a specific period.
                                    </CardDescription>
                                  </motion.div>
                                </motion.div>
                              </CardHeader>
                              <CardContent>
                                <motion.div variants={staggerItem}>
                                  <InfoAlert message="Create a subscription service. Users will pay the specified amount to access your content for the duration you set." />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                  <CreateService />
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        }
                      />
                      <Route
                        path="/admin/service/:id"
                        element={
                          <motion.div
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <Card className="border border-[#393E46] bg-transparent">
                              <CardHeader>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                >
                                  <motion.div variants={staggerItem}>
                                    <CardTitle className="text-[#EEEEEE]">Manage Subscription Service</CardTitle>
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <CardDescription className="text-[#EEEEEE]/70">
                                      Upload encrypted files that will be accessible to paid subscribers.
                                    </CardDescription>
                                  </motion.div>
                                </motion.div>
                              </CardHeader>
                              <CardContent>
                                <motion.div
                                  variants={staggerContainer}
                                  initial="hidden"
                                  animate="visible"
                                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                                >
                                  <motion.div variants={staggerItem}>
                                    <InfoAlert message="Users who purchase a subscription will be able to decrypt and view these files for the duration of their subscription." />
                                    <Service
                                      setRecipientAllowlist={setRecipientAllowlist}
                                      setCapId={setCapId}
                                    />
                                  </motion.div>
                                  <motion.div variants={staggerItem}>
                                    <div className="bg-[#222831]/80 p-6 rounded-lg border border-[#393E46]">
                                      <h3 className="text-lg font-medium text-[#EEEEEE] mb-4 flex items-center gap-2">
                                        <UploadCloudIcon className="w-5 h-5 text-[#00ADB5]" />
                                        Upload Subscription Content
                                      </h3>
                                      <WalrusUpload
                                        policyObject={recipientAllowlist}
                                        cap_id={capId}
                                        moduleName="subscription"
                                      />
                                    </div>
                                  </motion.div>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        }
                      />
                      <Route path="/admin/services" element={
                        <motion.div
                          variants={pageTransition}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <AllServices />
                        </motion.div>
                      } />
                      <Route path="/view/service/:id" element={
                        <motion.div
                          variants={pageTransition}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <FeedsToSubscribe suiAddress={currentAccount.address} />
                        </motion.div>
                      } />
                    </Routes>
                  }
                />
              </Routes>
            </PageTransition>
          ) : (
            <motion.div
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="max-w-md mx-auto mt-12 border border-[#393E46] bg-transparent">
                <CardHeader className="text-center">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={staggerItem}>
                      <div className="inline-block p-4 bg-[#00ADB5]/20 rounded-full mb-4">
                        <LockIcon className="w-12 h-12 text-[#00ADB5]" />
                      </div>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <CardTitle className="text-[#EEEEEE]">Connect Your Wallet</CardTitle>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <CardDescription className="text-[#EEEEEE]/70">
                        Please connect your wallet to access secure file uploading and sharing features.
                      </CardDescription>
                    </motion.div>
                  </motion.div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <motion.div variants={staggerItem}>
                    <ConnectButton />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;