# Walrusecure (Merged App) – How to Use

This README explains how to use the merged app (which combines the UI of frontend with the functionality of frontend2) to upload and access files.

## Prerequisites

- Ensure you have a wallet (for example, Sui Wallet) connected to the Testnet (or your chosen network) and that you have requested a balance (for example, from faucet.sui.io) so that you can perform transactions (for example, creating an allowlist or a subscription service). (Note: This merged app (Walrusecure) is intended for Testnet (or a chosen network) and is not currently configured for mainnet.)

## Step-by-Step Guide

### 1. Start the Development Server

Run the following command in your terminal (from the "frontend" folder):

npm run dev

This starts the Vite dev server (for example, at http://localhost:5174).

### 2. Connect Your Wallet

- Open your browser (for example, Chrome) and navigate to the app (for example, http://localhost:5174).
- On the landing page (or on the "Connect Your Wallet" card if you're not connected), click "Connect" (or "Connect Your Wallet") so that your wallet (for example, Sui Wallet) is connected. (You may be prompted to approve the connection.)

### 3. Choose a Sharing Model (Allowlist or Subscription)

- On the landing page, you'll see two buttons (or "Feature Cards"):
  • "Start with Allowlist" (for allowlist-based sharing)  
  • "Try Subscription Model" (for subscription-based sharing)  
- Click on one (for example, "Start with Allowlist") to proceed.

### 4. (Allowlist Example) – Create an Allowlist

- (If you chose "Start with Allowlist") you'll be taken to the "Allowlist Access Control" page.
- On that page, you'll see a "Create Allowlist" section (or "CreateAllowlist" component).  
  – Fill in the required fields (for example, "Name" and "Description") and click "Create."  
  – (This transaction creates an allowlist on the blockchain.)  
- Once created, you'll be redirected (or you can navigate) to the "Manage Allowlist" page (for example, at /admin/allowlist/:id).

### 5. (Allowlist Example) – Add Recipients (Addresses) to Your Allowlist

- On the "Manage Allowlist" page, you'll see a section (or "Allowlist" component) where you can "Add Recipient."  
  – Enter a recipient's address (for example, a Sui address) and click "Add."  
  – (This transaction adds that address to your allowlist.)  
- (You can repeat this step to add more addresses.)

### 6. (Allowlist Example) – Upload and Encrypt Files (Using WalrusUpload)

- On the "Manage Allowlist" page, you'll also see a "WalrusUpload" component (or "Upload" section).  
  – (This component is now rendered (with props) so that it uses the functionality from frontend2.)  
- Click "Choose File" (or "Upload") and select a file (for example, an image, a PDF, or an Excel file).  
  – (The file is then encrypted (using the "allowlist" module) and uploaded (for example, to Walrus Testnet).)  
- (You can repeat this step to upload more files.)

### 7. (Allowlist Example) – Accessing (or Decrypting) Files

- (If you're a recipient (i.e. your address is in the allowlist), you can navigate (or click "View" (or "Allowlist View")) to the "view" page (for example, at /view/allowlist/:id).  
  – (On that page, you'll see a list (or "Feeds" component) of uploaded files.)  
  – (Click on a file (or "Download") so that the file is decrypted (using your wallet's signature) and downloaded (or opened).)

### 8. (Subscription Example) – Create a Subscription Service

- (If you chose "Try Subscription Model") you'll be taken to the "Subscription Services" page.
- On that page, you'll see a "Create Subscription Service" section (or "CreateService" component).  
  – Fill in the required fields (for example, "Name," "Description," "Price," and "Duration") and click "Create."  
  – (This transaction creates a subscription service (or "subscription" module) on the blockchain.)  
- Once created, you'll be redirected (or you can navigate) to the "Manage Subscription Service" page (for example, at /admin/service/:id).

### 9. (Subscription Example) – Upload and Encrypt Files (Using WalrusUpload)

- On the "Manage Subscription Service" page, you'll also see a "WalrusUpload" component (or "Upload" section).  
  – (This component is now rendered (with props) so that it uses the functionality from frontend2.)  
- Click "Choose File" (or "Upload") and select a file (for example, an image, a PDF, or an Excel file).  
  – (The file is then encrypted (using the "subscription" module) and uploaded (for example, to Walrus Testnet).)  
- (You can repeat this step to upload more files.)

### 10. (Subscription Example) – Purchasing a Subscription (and Accessing Files)

- (If you're a user (or subscriber), you can navigate (or click "View" (or "Subscription View")) to the "view" page (for example, at /view/service/:id).  
  – (On that page, you'll see a "FeedsToSubscribe" (or "SubscriptionView") component.)  
  – (Click "Purchase" (or "Subscribe") so that you pay (for example, in SUI) for a subscription (for the duration you chose).)  
  – (Once subscribed, you'll see a list (or "Feeds") of uploaded files.)  
  – (Click on a file (or "Download") so that the file is decrypted (using your wallet's signature) and downloaded (or opened).)

## Summary

- **Allowlist Example:**  
  – Create an allowlist (on the "Allowlist Access Control" page).  
  – Add recipient addresses (on the "Manage Allowlist" page).  
  – Upload (and encrypt) files (using the "WalrusUpload" component (or "Upload" section) on the "Manage Allowlist" page).  
  – Recipients (whose addresses are in the allowlist) can view (or "Allowlist View") and decrypt (or download) the files (on the "view" page (for example, at /view/allowlist/:id)).  
- **Subscription Example:**  
  – Create a subscription service (on the "Subscription Services" page).  
  – Upload (and encrypt) files (using the "WalrusUpload" component (or "Upload" section) on the "Manage Subscription Service" page).  
  – Users (or subscribers) can purchase a subscription (on the "view" page (for example, at /view/service/:id)) and then view (or "Subscription View") and decrypt (or download) the files.

## Troubleshooting

- If you see an error (for example, "Failed to load PostCSS config" or "module is not defined in ES module scope"), please ensure that your "postcss.config.cjs" (or "postcss.config.js") is in CommonJS format (using "module.exports") and that your "tailwind.config.js" (or "tailwind.config.cjs") is also in CommonJS format (using "module.exports"). (You can also try renaming "postcss.config.js" to "postcss.config.cjs" if you're using "type": "module" in "package.json".)
- If you're not able to upload (or decrypt) files, please check that your wallet is connected (and that you have a balance) and that you're on the correct "Upload" (or "view") page (for example, /admin/allowlist/:id or /admin/service/:id).
- If you see an error (for example, "No valid SUI to pay the gas, please check your balance") when you try to create an allowlist (or perform a transaction), please check that your wallet (for example, Account #1 (0x2e9b7….d5e1)) has a valid (or non–zero) SUI balance (for example, by requesting a balance from faucet.sui.io (or your chosen faucet) on Testnet). (This is a common error if your wallet (or account) does not have enough SUI (or gas) to pay for the transaction.)

---

Happy uploading and accessing files! 