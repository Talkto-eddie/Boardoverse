import { getBoardoverseProgram } from "@/anchor/src";
import { AppConstants } from "@/lib/app_constants";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

const connection = AppConstants.APP_CONNECTION;
const program = getBoardoverseProgram({ connection } as any);

/**
 * Custom hook for Solana blockchain game interactions
 */
export default function useGameSol() {
    const userContext = useUser();
    const walletInstance = userHasWallet(userContext)
        ? userContext.solana.wallet
        : undefined;

    // Helper functions
    const validateWallet = (wallet: any) => {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }
        return wallet;
    };

    const findPDA = async (seeds: Buffer[], programId: PublicKey): Promise<PublicKey> => {
        const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
        return pda;
    };

    const createGameAccountSeeds = (creator: PublicKey, gameId: string): Buffer[] => {
        return [
            Buffer.from("BOARDOVERSE"),
            creator.toBuffer(),
            Buffer.from(gameId),
        ];
    };

    const createGameTokenAccountSeeds = (gamePDA: PublicKey): Buffer[] => {
        return [
            Buffer.from("BOARDOVERSE"),
            new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address).toBuffer(),
            gamePDA.toBuffer(),
        ];
    };

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
            console.log("mint", )
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

    // Main functions that use the helpers above

    /**
     * Creates a new game on the blockchain
     */
    const createGameTrx = async (gameId: string, stakeAmount: number, creator: PublicKey): Promise<string> => {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }

        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(creator, gameId),
            program.programId
        );

        const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);
        
        // Create token account instructions if needed
        const instructions = await createTokenAccountIfNeeded(creator, tokenMint, creator);
        
        if(instructions.length > 0){

            const blockhash = await connection.getLatestBlockhash();
            console.log("blockhash", blockhash.blockhash);

            const trx = new Transaction({
                ...blockhash,
                feePayer: walletInstance.publicKey,
            });

            trx.add(...instructions)

            const signature = await walletInstance.sendTransaction(trx, connection);
            console.log("created token account", signature)
        }
        // Get creator's token account
        const creatorTokenAccount = await getUserTokenAccount(creator);

        console.log("creatorTokenAccount", instructions.length);
        // const gameTokenAccount = await createGameTokenAccountSeeds(gamePDA);
        console.log("amoutn", stakeAmount * 10 ** AppConstants.APP_SUPPORTED_CURRENCY.decimals)
        // Add the main instruction
        const mainInstruction = await program.methods
            .startGame(gameId, new BN(stakeAmount * 10 ** AppConstants.APP_SUPPORTED_CURRENCY.decimals))
            .accountsPartial({
                game: gamePDA,
                creator: creator,
                creatorTokenAccount: creatorTokenAccount,
                mint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            }).instruction();
        
        // Add the main instruction to our array
        // instructions.push(mainInstruction);

        console.log("creatorTokenAccount", instructions.length);

        const blockhash = await connection.getLatestBlockhash();
        console.log("blockhash", blockhash.blockhash);

        const trx = new Transaction({
            ...blockhash,
            feePayer: walletInstance.publicKey,
        });

        // Add all instructions to the transaction
        trx.add(mainInstruction);

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    };

    /**
     * Settles a game by transferring funds to winner
     */
    const settleGameTrx = async (gameId: string, winner: PublicKey, creator: PublicKey) => {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }
        
        const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);
        
        // Create winner token account if needed
        const instructions = await createTokenAccountIfNeeded(winner, tokenMint, creator);
        
        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(creator, gameId),
            program.programId
        );

        const creatorTokenAccount = await getUserTokenAccount(creator);

        const winnerTokenAccount = await getUserTokenAccount(winner);

        // Find PDA for game token account
        const gameTokenAccountPDA = await findPDA(
            createGameTokenAccountSeeds(gamePDA),
            program.programId
        );

        const inx = await program.methods.endGame(
            winner
        ).accountsPartial({
            creator: creator,
            game: gamePDA,
            gameTokenAccount: gameTokenAccountPDA,
            winnerTokenAccount: winnerTokenAccount,
            destinationAccount: creatorTokenAccount,
            mint: tokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }).instruction();

        instructions.push(inx);

        const blockhash = await connection.getLatestBlockhash();

        const trx = new Transaction({
            ...blockhash,
            feePayer: winner,
        });

        trx.add(...instructions);

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    };

    async function joinGameTrx(
        gameId: string,
        creator: PublicKey,
        player: PublicKey,
    ) {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }

        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(creator, gameId),
            program.programId
        );

        const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        const playerTokenAccount = await getUserTokenAccount(player);

        // Find PDA for game token account
        const gameTokenAccountPDA = await findPDA(
            createGameTokenAccountSeeds(gamePDA),
            program.programId
        );


        const inx = await program.methods.join(
            gameId
        ).accountsPartial({
            game: gamePDA,
            player: player,
            playerTokenAccount: playerTokenAccount,
            gameTokenAccount: gameTokenAccountPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }).instruction();

        const blockhash = await connection.getLatestBlockhash();

        const trx = new Transaction({
            ...blockhash,
            feePayer: player,
        });

        trx.add(inx)

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    }

    return {
        createGameTrx,
        settleGameTrx,
        joinGameTrx
    }
}