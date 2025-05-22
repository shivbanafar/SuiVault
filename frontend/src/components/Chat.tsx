import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Save, Share2, Plane, Wallet, Cloud, Luggage, Utensils, AlertCircle, Wifi, WifiOff, ShieldIcon, CreditCardIcon, FileIcon, LockIcon, AlertCircleIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { messageAnimation, staggerContainer, staggerItem, loadingAnimation, gradientBorderAnimation } from "@/lib/animations";

interface Message {
  sender: "User" | "AI";
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface Suggestion {
  icon: React.ReactNode;
  text: string;
  prompt: string;
  color: string;
}

const suggestions: Suggestion[] = [
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    text: "Document Security",
    prompt: "How does SuiVault ensure the security of enterprise documents?",
    color: "hsl(var(--primary))",
  },
  {
    icon: <CreditCardIcon className="w-5 h-5" />,
    text: "Access Control",
    prompt: "How can I manage access permissions for sensitive documents?",
    color: "hsl(var(--primary))",
  },
  {
    icon: <FileIcon className="w-5 h-5" />,
    text: "Audit Trail",
    prompt: "How does the blockchain audit trail work for document changes?",
    color: "hsl(var(--primary))",
  },
  {
    icon: <LockIcon className="w-5 h-5" />,
    text: "Compliance",
    prompt: "How does SuiVault help with regulatory compliance for document storage?",
    color: "hsl(var(--primary))",
  },
  {
    icon: <AlertCircleIcon className="w-5 h-5" />,
    text: "Getting Started",
    prompt: "What are the first steps to start using SuiVault for enterprise document management?",
    color: "hsl(var(--primary))",
  },
];

// API configuration - Flask is running on 127.0.0.1:5000
const API_BASE_URL = "https://suivault.onrender.com";

// Add this CSS animation at the top of the file, after imports
const messageStyles = {
  aiMessage: `
    relative rounded-lg p-4 bg-[#222831]/80 backdrop-blur-sm
    border border-transparent hover:border-[#00ADB5] transition-colors duration-300
  `,
  userMessage: `
    relative rounded-lg p-4 bg-[#00ADB5] text-[#222831]
  `,
  errorMessage: `
    relative rounded-lg p-4 bg-red-500/10 text-red-500
  `
};

export function Chat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [savedStatus, setSavedStatus] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      if (response.status === 200) {
        setConnectionStatus('connected');
        console.log("Backend connection established successfully");
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error("Backend connection failed:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = async (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent, suggestedPrompt);
  };

  const handleSubmit = async (e: React.FormEvent, customPrompt?: string) => {
    e.preventDefault();
    const currentPrompt = customPrompt || prompt.trim();
    
    if (!currentPrompt) {
      console.warn("Empty prompt submitted");
      return;
    }

    // Check connection before sending
    if (connectionStatus === 'disconnected') {
      await checkBackendConnection();
      if (connectionStatus === 'disconnected') {
        const errorMessage: Message = { 
          sender: "AI", 
          text: "❌ Cannot connect to the travel assistant service. Please check if the backend server is running on http://localhost:5000", 
          timestamp: new Date().toLocaleTimeString(), 
          isError: true 
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        return;
      }
    }

    const userMessage: Message = { 
      sender: "User", 
      text: currentPrompt, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      setIsTyping(true);
      console.log("Sending prompt request:", currentPrompt);
      
      const response = await axios.post(
        `${API_BASE_URL}/prompt`, 
        { prompt: currentPrompt },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log("Response received:", response.data);
      
      if (response.data && response.data.response) {
        const aiMessage: Message = { 
          sender: "AI", 
          text: response.data.response, 
          timestamp: new Date().toLocaleTimeString() 
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        throw new Error("Invalid response format from server");
      }
      
    } catch (error) {
      console.error("Error details:", error);
      
      let errorText = "I'm having trouble connecting to the travel assistant service. ";
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorText += "The backend server appears to be down. Please make sure the Flask server is running on port 5000.";
          setConnectionStatus('disconnected');
        } else if (error.code === 'ETIMEDOUT') {
          errorText += "The request timed out. Please try again.";
        } else if (error.response) {
          errorText += `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
        } else if (error.request) {
          errorText += "No response from server. Please check your connection.";
        } else {
          errorText += `Request error: ${error.message}`;
        }
      } else {
        errorText += `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      const errorMessage: Message = { 
        sender: "AI", 
        text: errorText, 
        timestamp: new Date().toLocaleTimeString(), 
        isError: true 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
      setPrompt("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const saveConversation = () => {
    try {
      const conversationData = {
        messages,
        exportDate: new Date().toLocaleString(),
        metadata: {
          totalMessages: messages.length,
          conversationDuration:
            messages.length > 0
              ? `${Math.round(
                  (new Date().getTime() - new Date(messages[0].timestamp).getTime()) / 1000 / 60
                )} minutes`
              : "0 minutes",
          platform: "SuiVault",
          version: "1.0.0"
        },
      };

      // Create a formatted text version for better readability
      const formattedText = messages
        .map((msg) => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          return `[${timestamp}] ${msg.sender}:\n${msg.text}\n`;
        })
        .join("\n---\n\n");

      // Save as JSON
      const jsonBlob = new Blob([JSON.stringify(conversationData, null, 2)], {
        type: "application/json",
      });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `suivault-conversation-${new Date().toISOString().slice(0, 10)}.json`;

      // Save as TXT
      const txtBlob = new Blob([formattedText], { type: "text/plain" });
      const txtUrl = URL.createObjectURL(txtBlob);
      const txtLink = document.createElement("a");
      txtLink.href = txtUrl;
      txtLink.download = `suivault-conversation-${new Date().toISOString().slice(0, 10)}.txt`;

      setSavedStatus("Saving...");
      
      // Create a temporary container for the download buttons
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "50%";
      container.style.left = "50%";
      container.style.transform = "translate(-50%, -50%)";
      container.style.backgroundColor = "#222831";
      container.style.padding = "20px";
      container.style.borderRadius = "8px";
      container.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      container.style.zIndex = "1000";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "10px";
      container.style.border = "1px solid #00ADB5";

      const title = document.createElement("h3");
      title.textContent = "Save Conversation";
      title.style.color = "#EEEEEE";
      title.style.marginBottom = "10px";
      container.appendChild(title);

      const jsonButton = document.createElement("button");
      jsonButton.textContent = "Save as JSON";
      jsonButton.style.padding = "8px 16px";
      jsonButton.style.backgroundColor = "#00ADB5";
      jsonButton.style.color = "#222831";
      jsonButton.style.border = "none";
      jsonButton.style.borderRadius = "4px";
      jsonButton.style.cursor = "pointer";
      jsonButton.onclick = () => {
        jsonLink.click();
        document.body.removeChild(container);
        setSavedStatus("Saved as JSON!");
        setTimeout(() => setSavedStatus(""), 2000);
      };

      const txtButton = document.createElement("button");
      txtButton.textContent = "Save as Text";
      txtButton.style.padding = "8px 16px";
      txtButton.style.backgroundColor = "#393E46";
      txtButton.style.color = "#EEEEEE";
      txtButton.style.border = "none";
      txtButton.style.borderRadius = "4px";
      txtButton.style.cursor = "pointer";
      txtButton.onclick = () => {
        txtLink.click();
        document.body.removeChild(container);
        setSavedStatus("Saved as Text!");
        setTimeout(() => setSavedStatus(""), 2000);
      };

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "Cancel";
      cancelButton.style.padding = "8px 16px";
      cancelButton.style.backgroundColor = "transparent";
      cancelButton.style.color = "#EEEEEE";
      cancelButton.style.border = "1px solid #393E46";
      cancelButton.style.borderRadius = "4px";
      cancelButton.style.cursor = "pointer";
      cancelButton.onclick = () => {
        document.body.removeChild(container);
        setSavedStatus("");
      };

      container.appendChild(jsonButton);
      container.appendChild(txtButton);
      container.appendChild(cancelButton);
      document.body.appendChild(container);

      // Cleanup URLs after a delay
      setTimeout(() => {
        URL.revokeObjectURL(jsonUrl);
        URL.revokeObjectURL(txtUrl);
      }, 1000);

    } catch (error) {
      console.error("Error saving conversation:", error);
      setSavedStatus("Error saving!");
      setTimeout(() => setSavedStatus(""), 2000);
    }
  };

  const shareConversation = async () => {
    try {
      const formattedText = messages
        .map((msg) => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          return `[${timestamp}] ${msg.sender}:\n${msg.text}\n`;
        })
        .join("\n---\n\n");

      const shareData = {
        title: "SuiVault Conversation",
        text: formattedText,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setSavedStatus("Shared!");
          setTimeout(() => setSavedStatus(""), 2000);
        } catch (error) {
          if (error.name !== 'AbortError') {
            throw error;
          }
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.backgroundColor = "#222831";
        container.style.padding = "20px";
        container.style.borderRadius = "8px";
        container.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        container.style.zIndex = "1000";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        container.style.border = "1px solid #00ADB5";
        container.style.maxWidth = "90%";
        container.style.width = "400px";

        const title = document.createElement("h3");
        title.textContent = "Share Conversation";
        title.style.color = "#EEEEEE";
        title.style.marginBottom = "10px";
        container.appendChild(title);

        const textarea = document.createElement("textarea");
        textarea.value = formattedText;
        textarea.style.width = "100%";
        textarea.style.height = "200px";
        textarea.style.padding = "8px";
        textarea.style.backgroundColor = "#393E46";
        textarea.style.color = "#EEEEEE";
        textarea.style.border = "1px solid #00ADB5";
        textarea.style.borderRadius = "4px";
        textarea.style.resize = "none";
        textarea.readOnly = true;
        container.appendChild(textarea);

        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.justifyContent = "flex-end";

        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy to Clipboard";
        copyButton.style.padding = "8px 16px";
        copyButton.style.backgroundColor = "#00ADB5";
        copyButton.style.color = "#222831";
        copyButton.style.border = "none";
        copyButton.style.borderRadius = "4px";
        copyButton.style.cursor = "pointer";
        copyButton.onclick = async () => {
          try {
            await navigator.clipboard.writeText(formattedText);
            copyButton.textContent = "Copied!";
            setTimeout(() => {
              copyButton.textContent = "Copy to Clipboard";
            }, 2000);
          } catch (err) {
            console.error("Failed to copy:", err);
            copyButton.textContent = "Failed to copy";
            setTimeout(() => {
              copyButton.textContent = "Copy to Clipboard";
            }, 2000);
          }
        };

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.padding = "8px 16px";
        closeButton.style.backgroundColor = "transparent";
        closeButton.style.color = "#EEEEEE";
        closeButton.style.border = "1px solid #393E46";
        closeButton.style.borderRadius = "4px";
        closeButton.style.cursor = "pointer";
        closeButton.onclick = () => {
          document.body.removeChild(container);
        };

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(closeButton);
        container.appendChild(buttonContainer);
        document.body.appendChild(container);
      }
    } catch (error) {
      console.error("Error sharing conversation:", error);
      setSavedStatus("Error sharing!");
      setTimeout(() => setSavedStatus(""), 2000);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="border-none bg-[#222831]/50 shadow-lg">
        <CardHeader className="border-b border-[#393E46] bg-[#222831]/80 backdrop-blur-sm">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between"
          >
            <motion.div variants={staggerItem}>
              <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/60 bg-clip-text text-transparent">
                <LockIcon className="w-6 h-6 text-[#00ADB5]" />
                SuiVault
                <motion.div
                  variants={loadingAnimation}
                  animate="animate"
                >
                  {connectionStatus === 'connected' && <Wifi className="w-4 h-4 text-green-500" />}
                  {connectionStatus === 'disconnected' && <WifiOff className="w-4 h-4 text-red-500" />}
                  {connectionStatus === 'checking' && (
                    <div className="w-4 h-4 border-2 border-[#00ADB5] border-t-transparent rounded-full animate-spin" />
                  )}
                </motion.div>
              </CardTitle>
              <CardDescription className="text-base mt-2 text-[#EEEEEE]/70">
                Your guide to secure document management with blockchain protection
                {connectionStatus === 'disconnected' && (
                  <span className="text-red-500 ml-2">• Connection Error</span>
                )}
              </CardDescription>
            </motion.div>
            <motion.div variants={staggerItem} className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={checkBackendConnection}
                  className="hover:bg-[#00ADB5]/10 text-[#EEEEEE]"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={saveConversation}
                  className="hover:bg-[#00ADB5]/10 text-[#EEEEEE]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savedStatus || "Save"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareConversation}
                  className="hover:bg-[#00ADB5]/10 text-[#EEEEEE]"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[500px] rounded-lg p-4 mb-4">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="text-center py-8"
                >
                  <motion.div variants={staggerItem}>
                    <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/60 bg-clip-text text-transparent">
                      Welcome to SuiVault
                    </h2>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <p className="text-[#EEEEEE]/70 mb-6">How can I help you with secure file sharing today?</p>
                  </motion.div>
                  <motion.div 
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        variants={staggerItem}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            className="h-auto py-4 px-6 w-full flex flex-col items-center gap-2 hover:bg-[#00ADB5]/10 group relative overflow-hidden text-[#EEEEEE]"
                            onClick={() => handleSuggestionClick(suggestion.prompt)}
                            disabled={connectionStatus === 'disconnected'}
                          >
                            <div className="text-[#00ADB5] group-hover:scale-110 transition-transform">
                              {suggestion.icon}
                            </div>
                            <span>{suggestion.text}</span>
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      variants={messageAnimation}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={cn(
                        "flex",
                        message.sender === "User" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative max-w-[80%]",
                          message.sender === "User"
                            ? messageStyles.userMessage
                            : message.isError
                            ? messageStyles.errorMessage
                            : messageStyles.aiMessage
                        )}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{message.sender}</span>
                            <span className="text-xs opacity-70">{message.timestamp}</span>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      variants={messageAnimation}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex justify-start"
                    >
                      <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
          <motion.form 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} 
            className="flex gap-2"
          >
            <motion.div variants={staggerItem} className="flex-1">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about SuiVault features..."
                className="flex-1 bg-[#222831]/50 backdrop-blur-sm border-[#393E46] focus:border-[#00ADB5] focus:ring-1 focus:ring-[#00ADB5]/20 text-[#EEEEEE] placeholder-[#EEEEEE]/50"
                disabled={connectionStatus === 'disconnected' || isTyping}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="submit" 
                  disabled={!prompt.trim() || isTyping || connectionStatus === 'disconnected'}
                  className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-[#222831] relative overflow-hidden group"
                >
                  <Send className="w-4 h-4 relative z-10" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
          {connectionStatus === 'disconnected' && (
            <motion.div
              variants={messageAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-md"
            >
              <p className="text-sm text-red-500">
                ⚠️ Backend server is not responding. Make sure your Flask server is running on port 5000.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}