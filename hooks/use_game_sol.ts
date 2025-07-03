import { getBoardoverseProgram } from "@/anchor/src";
import { AppConstants } from "@/lib/app_constants";
import { createOrUpdateUser } from "@/lib/user-manager";
// import { useUser, useWallet } from "@civic/auth-web3/react";
// import { userHasWallet } from "@civic/auth-web3";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useEffect } from "react";

const connection = AppConstants.APP_CONNECTION;
const program = getBoardoverseProgram({ connection } as any);

/**
 * Custom hook for Solana blockchain game interactions
 */
export default function useGameSol() {
    // const userContext = useUser();
    // const walletInstance = userHasWallet(userContext)
    //     ? userContext.solana.wallet
    //     : undefined;
    const walletInstance = useWallet();

    useEffect(() => {
        if (walletInstance.connected && walletInstance.publicKey) {
            createOrUpdateUser(walletInstance.publicKey.toString())
                .catch(console.error);
        }
    }, [walletInstance.connected, walletInstance.publicKey]);

    
    const findPDA = async (seeds: Buffer[], programId: PublicKey): Promise<PublicKey> => {
        const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
        return pda;
    };

    const createGameAccountSeeds = (gameId: string): Buffer[] => {
        return [
            Buffer.from("BOARDOVERSE"),
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
    // const createTokenAccountIfNeeded = async (
    //     owner: PublicKey,
    //     mint: PublicKey,
    //     feePayer: PublicKey
    // ): Promise<TransactionInstruction[]> => {
    //     const instructions: TransactionInstruction[] = [];

    //     if (!connection) throw new Error("Connection not established");

    //     try {
    //         // Get the address of the associated token account
    //         const tokenAccount = await getAssociatedTokenAddress(mint, owner);

    //         // Check if the account exists
    //         const accountInfo = await connection.getAccountInfo(tokenAccount);
    //         console.log("mint",)
    //         // If account doesn't exist, create instruction to create it
    //         if (!accountInfo) {
    //             instructions.push(
    //                 createAssociatedTokenAccountInstruction(
    //                     feePayer, // fee payer
    //                     tokenAccount,
    //                     owner,
    //                     mint,
    //                     TOKEN_PROGRAM_ID,
    //                     ASSOCIATED_TOKEN_PROGRAM_ID,
    //                 )
    //             );
    //             console.log(`Creating token account instruction for ${owner.toString()}`);
    //             console.log("Token account does not exist, creating new one:", tokenAccount.toString());
    //         }

    //         return instructions;
    //     } catch (error) {
    //         console.error("Error checking token account:", error);
    //         throw error;
    //     }
    // };

    // Main functions that use the helpers above

    /**
     * Creates a new game on the blockchain
     */
    const createGameTrx = async (gameId: string, stakeAmount: number, creator: PublicKey): Promise<string> => {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }

        // Ensure user exists in database
        await createOrUpdateUser(creator.toString());

        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(gameId),
            program.programId
        );

        // const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        // Create token account instructions if needed
        // const instructions = await createTokenAccountIfNeeded(creator, tokenMint, creator);

        // if (instructions.length > 0) {

        //     const blockhash = await connection.getLatestBlockhash();
        //     console.log("blockhash", blockhash.blockhash);

        //     const trx = new Transaction({
        //         ...blockhash,
        //         feePayer: walletInstance.publicKey,
        //     });

        //     trx.add(...instructions)

        //     const signature = await walletInstance.sendTransaction(trx, connection);
        //     console.log("created token account", signature)
        // }
        // // Get creator's token account
        // const creatorTokenAccount = await getUserTokenAccount(creator);

        // console.log("creatorTokenAccount", instructions.length);
        // const gameTokenAccount = await createGameTokenAccountSeeds(gamePDA);
        // console.log("amoutn", stakeAmount * 10 ** AppConstants.APP_SUPPORTED_CURRENCY.decimals)
        // Add the main instruction
        const mainInstruction = await program.methods
            .createGame(
                gameId,
                new BN(stakeAmount * 10 ** AppConstants.APP_SUPPORTED_CURRENCY.decimals),
                AppConstants.ARBITER_PUBKEY
            )
            .accountsPartial({
                game: gamePDA,
                player1: creator,
                systemProgram: SystemProgram.programId,
            }).instruction();

        // Add the main instruction to our array
        // instructions.push(mainInstruction);

        // console.log("creatorTokenAccount", instructions.length);

        const blockhash = await connection.getLatestBlockhash();

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
            createGameAccountSeeds(gameId),
            program.programId
        );

        // const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        // const playerTokenAccount = await getUserTokenAccount(player);

        // Find PDA for game token account
        // const gameTokenAccountPDA = await findPDA(
        //     createGameTokenAccountSeeds(gamePDA),
        //     program.programId
        // );


        const inx = await program.methods.joinGame(
            gameId
        ).accountsPartial({
            game: gamePDA,
            player2: player,
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

    /**
     * Settles a game by transferring funds to winner
     */
    const stopGameTrx = async (gameId: string, stopper: PublicKey, player1: PublicKey, player2: PublicKey) => {
        if (!walletInstance) {
            throw new Error("Wallet not connected");
        }

        if (stopper !== player1 && stopper !== player2) {
            throw new Error("Only player1 or player2 can stop the game");
        }

        // const tokenMint = new PublicKey(AppConstants.APP_SUPPORTED_CURRENCY.address);

        // Create winner token account if needed
        // const instructions = await createTokenAccountIfNeeded(winner, tokenMint, creator);

        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(gameId),
            program.programId
        );

        // const creatorTokenAccount = await getUserTokenAccount(creator);

        // const winnerTokenAccount = await getUserTokenAccount(winner);

        // // Find PDA for game token account
        // const gameTokenAccountPDA = await findPDA(
        //     createGameTokenAccountSeeds(gamePDA),
        //     program.programId
        // );

        const inx = await program.methods.stopGame(
            gameId
        ).accountsPartial({
            game: gamePDA,
            arbiter: AppConstants.ARBITER_PUBKEY,
            player1: player1,
            player2: player2,
            systemProgram: SystemProgram.programId,
        }).instruction();

        // inx.push(inx);

        const blockhash = await connection.getLatestBlockhash();

        const trx = new Transaction({
            ...blockhash,
            feePayer: stopper,
        });

        trx.add(inx);

        const signature = await walletInstance.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    };


    /**
     * Declares game winner via server-side API (secure)
     */
    const declareGameWinnerTrx = async (
        gameId: string,
        winner: PublicKey,
        player1: PublicKey,
        player2: PublicKey
    ): Promise<string> => {
        try {
            const response = await fetch('/api/games/declare-winner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId,
                    winnerWallet: winner.toString(),
                    player1Wallet: player1.toString(),
                    player2Wallet: player2.toString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to declare winner');
            }

            console.log('Winner declared successfully:', data);
            return data.signature;

        } catch (error: any) {
            console.error('Failed to declare game winner:', error);
            throw error;
        }
    };


    return {
        createGameTrx,
        joinGameTrx,
        stopGameTrx,
        declareGameWinnerTrx,
    }
}