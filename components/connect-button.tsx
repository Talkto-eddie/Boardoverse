import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

const ConnectWallet = () => {
  const { connected, publicKey } = useWallet();
  const { setUser, setConnecting, disconnect } = useUserStore();

  useEffect(() => {
    const handleWalletChange = async () => {
      const newAddress = connected && publicKey ? publicKey.toBase58() : null;

      if (newAddress) {
        try {
          setConnecting(true); // Indicate connection is in progress
          setUser(newAddress); // Update Zustand store with wallet address
          console.log("Wallet address updated successfully:", newAddress);
          // Let UserInitializer handle navigation instead of redirecting here
        } catch (error) {
          console.error("Failed to update wallet address:", error);
          setConnecting(false); // Reset connection state on error
        }
      } else {
        disconnect(); // Clear Zustand store if wallet is disconnected
      }
    };

    handleWalletChange();
  }, [connected, publicKey, setUser, setConnecting, disconnect]);

  return (
    <div>
      <WalletMultiButton />
    </div>
  );
};

export default ConnectWallet;