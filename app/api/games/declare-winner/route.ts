// app/api/games/declare-winner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBoardoverseProgram } from "@/anchor/src";
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram, Keypair } from '@solana/web3.js';
import { AppConstants } from '@/lib/app_constants';

const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
);

const program = getBoardoverseProgram({ connection } as any);

// Helper functions (same as in your hook)
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gameId, winnerWallet, player1Wallet, player2Wallet } = body;

        // Validate input
        if (!gameId || !winnerWallet || !player1Wallet || !player2Wallet) {
            return NextResponse.json(
                { error: 'Missing required fields: gameId, winnerWallet, player1Wallet, player2Wallet' },
                { status: 400 }
            );
        }

        // Validate that winner is one of the players
        if (winnerWallet !== player1Wallet && winnerWallet !== player2Wallet) {
            return NextResponse.json(
                { error: 'Winner must be one of the game players' },
                { status: 400 }
            );
        }

        // Get server constants (arbiter keypair)
        const ARBITER_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.VAULT_KEY || "[]")));

        // Convert string addresses to PublicKey objects
        const winner = new PublicKey(winnerWallet);
        const player1 = new PublicKey(player1Wallet);
        const player2 = new PublicKey(player2Wallet);

        // Find PDA for game account
        const gamePDA = await findPDA(
            createGameAccountSeeds(gameId),
            program.programId
        );

        // Verify game exists and is in the correct state
        const gameAccount = await program.account.game.fetch(gamePDA);
        if (!gameAccount) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        // Additional game state validations can be added here
        // e.g., check if game is in "playing" status, not already finished, etc.

        // Create the declare winner instruction
        const instruction = await program.methods
            .declareWinner(winner, gameId)
            .accountsPartial({
                game: gamePDA,
                arbiter: ARBITER_KEYPAIR.publicKey,
                player1: player1,
                player2: player2,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        // Create and send transaction
        const blockhash = await connection.getLatestBlockhash();

        const transaction = new Transaction({
            ...blockhash,
            feePayer: ARBITER_KEYPAIR.publicKey,
        });

        transaction.add(instruction);

        // Sign and send transaction
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [ARBITER_KEYPAIR],
            {
                commitment: 'confirmed',
                preflightCommitment: 'confirmed',
            }
        );

        console.log(`Game ${gameId} winner declared. Transaction: ${signature}`);

        return NextResponse.json({
            success: true,
            signature,
            winner: winnerWallet,
            gameId
        });

    } catch (error: any) {
        console.error('Failed to declare game winner:', error);

        // Handle specific Solana errors
        if (error.message?.includes('0x1')) {
            return NextResponse.json(
                { error: 'Insufficient funds for transaction' },
                { status: 400 }
            );
        } else if (error.message?.includes('0x0')) {
            return NextResponse.json(
                { error: 'Invalid instruction data' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to declare winner' },
            { status: 500 }
        );
    }
}

// Optional: Add GET method to check game status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get('gameId');

        if (!gameId) {
            return NextResponse.json(
                { error: 'gameId parameter required' },
                { status: 400 }
            );
        }

        const gamePDA = await findPDA(
            createGameAccountSeeds(gameId),
            program.programId
        );

        const gameAccount = await program.account.game.fetch(gamePDA);

        return NextResponse.json({
            gameId,
            gameAccount: {
                player1: gameAccount.player1.toString(),
                player2: gameAccount.player2?.toString(),
                arbiter: gameAccount.arbiter.toString(),
                winner: gameAccount.winner?.toString()
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch game data' },
            { status: 500 }
        );
    }
}