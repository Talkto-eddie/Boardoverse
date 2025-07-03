import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { checkAndSetupUser } from "@/lib/user-manager";
import { toast } from "sonner";

const ConnectWallet = () => {
  const { connected, publicKey } = useWallet();
  const { setUser, setUserData, setWalletAddress, setConnecting, clear } = useUserStore();

  useEffect(() => {
    const handleWalletChange = async () => {
      const newAddress = connected && publicKey ? publicKey.toBase58() : null;

      if (newAddress) {
        try {
          setConnecting(true); // Indicate connection is in progress
          setWalletAddress(newAddress); // Update Zustand store with wallet address
          
          // Use the centralized user management function
          const result = await checkAndSetupUser(newAddress);

          if (result.error) {
            throw new Error(result.error);
          }

          // Update Zustand store with full user data
          setUser(newAddress);
          setUserData(result.userData || null);
          setWalletAddress(newAddress);

          // Show appropriate message
          if (result.isNewUser) {
            toast.success(result.message);
          } else {
            toast.success(result.message);
          }

        } catch (error) {
          console.error("Failed to update wallet address:", error);
          toast.error("Failed to connect wallet");
          setConnecting(false);
        }
      } else {
        clear(); 
      }
    };

    handleWalletChange();
  }, [connected, publicKey, setUser, setUserData, setWalletAddress, setConnecting, clear]);

  return (
    <div>
      <WalletMultiButton />
    </div>
  );
};

export default ConnectWallet;