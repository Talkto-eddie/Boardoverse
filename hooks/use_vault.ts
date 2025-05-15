import { AppConstants } from "@/lib/app_constants";
import { joinGame } from "@/redux/features/game/gameSlice";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";


const connection = AppConstants.APP_CONNECTION;

export default function useVault() {
    const [vaultAddress, setVaultAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const userContext = useUser();
    const walletInstance = userHasWallet(userContext)
        ? userContext.solana.wallet
        : undefined;
    

    useEffect(() => {
        const fetchVaultAddress = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch('/api/vault');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch vault address: ${response.status}`);
                }
                
                const data = await response.json();
                
                setVaultAddress(data.address);
            } catch (err) {
                console.error('Error fetching vault address:', err);
                setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchVaultAddress();
    }, []);

    const createGameTrx = async(stakeAmount: number, creator: PublicKey): Promise<string> => {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }

        // const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        const instructions = [];//await createTokenAccountIfNeeded(creator, tokenMint, creator);

        // Get creator's token account
        // const creatorTokenAccount = await getUserTokenAccount(creator);
        
        // deduct user wallet and credit vault
        const mainInstruction = await SystemProgram.transfer({
            fromPubkey: creator,
            toPubkey: new PublicKey(vaultAddress!),
            lamports: stakeAmount * LAMPORTS_PER_SOL,
        })

        // return transaction hash as id
        const blockhash = await connection.getLatestBlockhash();

        const trx = new Transaction({
            ...blockhash,
            feePayer: walletInstance.publicKey,
        });

        instructions.push(mainInstruction);

        // Add all instructions to the transaction
        trx.add(...instructions);

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    }

    const joinGameTrx = async (stakeAmount: number, player: PublicKey): Promise<string> => {
        // deduct wallet of who's joining and credit vault
        if (!walletInstance || !vaultAddress) {
            throw new Error("Wallet not connected");
        }

        // const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        const instructions = [];//await createTokenAccountIfNeeded(creator, tokenMint, creator);

        // Get creator's token account
        // const creatorTokenAccount = await getUserTokenAccount(creator);

        // deduct user wallet and credit vault
        const mainInstruction = await SystemProgram.transfer({
            fromPubkey: player,
            toPubkey: new PublicKey(vaultAddress!),
            lamports: stakeAmount * LAMPORTS_PER_SOL,
        })

        // return transaction hash as id
        const blockhash = await connection.getLatestBlockhash();

        const trx = new Transaction({
            ...blockhash,
            feePayer: walletInstance.publicKey,
        });

        instructions.push(mainInstruction);

        // Add all instructions to the transaction
        trx.add(...instructions);

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    }

    // This function credits the winner and can also be called to end the game when there is no winner
    function settleGameTrx(amountStaked: Number, winner: PublicKey) {
        // send post request to the api/vault to credit the winner server side
    }


    const getUserTokenAccount = async (userPublicKey: PublicKey): Promise<PublicKey> => {
        const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);
        return getAssociatedTokenAddress(tokenMint, userPublicKey);
    };

    // Add this new function to the hook
    /**
     * Creates token account instruction if needed
     * @param owner The public key of the token account owner
     * @param mint The token mint address
     * @returns Instructions to create token account if needed, or empty array if already exists
     */
    const createTokenAccountIfNeeded = async (
        owner: PublicKey,
        mint: PublicKey,
        feePayer: PublicKey
    ): Promise<TransactionInstruction[]> => {
        const instructions: TransactionInstruction[] = [];

        if (!connection) throw new Error("Connection not established");

        try {
            // Get the address of the associated token account
            const tokenAccount = await getAssociatedTokenAddress(mint, owner);

            // Check if the account exists
            const accountInfo = await connection.getAccountInfo(tokenAccount);
            console.log("mint",)
            // If account doesn't exist, create instruction to create it
            if (!accountInfo) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        feePayer, // fee payer
                        tokenAccount,
                        owner,
                        mint,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                    )
                );
                console.log(`Creating token account instruction for ${owner.toString()}`);
                console.log("Token account does not exist, creating new one:", tokenAccount.toString());
            }

            return instructions;
        } catch (error) {
            console.error("Error checking token account:", error);
            throw error;
        }
    };

    return {
        vaultAddress,
        isLoading,
        error,
        createGameTrx,
        joinGameTrx,
        settleGameTrx
    };
    
}