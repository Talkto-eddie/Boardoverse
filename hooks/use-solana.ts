// import { useState, useEffect, useCallback } from 'react';
// import { 
//   Connection, 
//   PublicKey, 
//   Transaction, 
//   clusterApiUrl, 
//   LAMPORTS_PER_SOL,
//   SystemProgram
// } from '@solana/web3.js';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { toast } from 'sonner';

// // Define the network to connect to
// const SOLANA_NETWORK = 'devnet'; // or 'mainnet-beta', 'testnet'

// /**
//  * Custom hook for interacting with Solana blockchain
//  */
// export function useSolana() {
//   const [connection, setConnection] = useState<Connection | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Initialize connection
//   useEffect(() => {
//     const conn = AppConstants.;
//     setConnection(conn);
    
//     return () => {
//       // Any cleanup if needed
//     };
//   }, []);

//   // Fetch balance when wallet is connected
//   useEffect(() => {
//     if (publicKey && connection) {
//       fetchBalance();
//     } else {
//       setBalance(null);
//     }
//   }, [publicKey, connection]);

//   // Fetch balance
//   const fetchBalance = useCallback(async () => {
//     if (!publicKey || !connection) return;
    
//     try {
//       setIsLoading(true);
//       const balance = await connection.getBalance(publicKey);
//       setBalance(balance / LAMPORTS_PER_SOL);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching balance:', err);
//       setError('Failed to fetch balance');
//       toast.error('Failed to fetch wallet balance');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [publicKey, connection]);

//   // Send SOL
//   const sendSol = useCallback(async (
//     to: string, 
//     amount: number
//   ): Promise<string | null> => {
//     if (!publicKey || !signTransaction || !connection) {
//       toast.error('Wallet not connected');
//       return null;
//     }

//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const toPublicKey = new PublicKey(to);
//       const transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: publicKey,
//           toPubkey: toPublicKey,
//           lamports: amount * LAMPORTS_PER_SOL
//         })
//       );
      
//       // Get recent blockhash
//       const { blockhash } = await connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = publicKey;
      
//       // Sign transaction
//       const signedTransaction = await signTransaction(transaction);
      
//       // Send transaction
//       const signature = await connection.sendRawTransaction(
//         signedTransaction.serialize()
//       );
      
//       // Confirm transaction
//       await connection.confirmTransaction(signature);
      
//       // Refresh balance
//       fetchBalance();
      
//       toast.success('Transaction sent successfully');
//       return signature;
//     } catch (err) {
//       console.error('Error sending SOL:', err);
//       const errorMessage = (err as Error).message || 'Failed to send transaction';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       return null;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [publicKey, signTransaction, connection, fetchBalance]);

//   // Request airdrop (for devnet testing)
//   const requestAirdrop = useCallback(async (amount: number = 1): Promise<boolean> => {
//     if (!publicKey || !connection) {
//       toast.error('Wallet not connected');
//       return false;
//     }

//     try {
//       setIsLoading(true);
//       const signature = await connection.requestAirdrop(
//         publicKey,
//         amount * LAMPORTS_PER_SOL
//       );
      
//       await connection.confirmTransaction(signature);
//       fetchBalance();
//       toast.success(`${amount} SOL airdropped successfully`);
//       return true;
//     } catch (err) {
//       console.error('Error requesting airdrop:', err);
//       toast.error('Failed to request airdrop');
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [publicKey, connection, fetchBalance]);

//   // Get token balance (for SPL tokens)
//   const getTokenBalance = useCallback(async (tokenAddress: string): Promise<number | null> => {
//     if (!publicKey || !connection) return null;

//     try {
//       // This is a simplified version - actual implementation would need token-program imports
//       // and proper token account lookup
//       return 0; // Placeholder
//     } catch (err) {
//       console.error('Error fetching token balance:', err);
//       return null;
//     }
//   }, [publicKey, connection]);

//   return {
//     connection,
//     publicKey,
//     connected,
//     connecting,
//     balance,
//     isLoading,
//     error,
//     fetchBalance,
//     sendSol,
//     requestAirdrop,
//     getTokenBalance,
//   };
// }