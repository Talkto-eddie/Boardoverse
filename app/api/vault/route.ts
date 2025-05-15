import { Keypair } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
    try {
        // Get vault address from environment variables
        const vaultAddress = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.VAULT_KEY || "[]"))).publicKey.toBase58()

        if (!vaultAddress) {
            console.error('Vault address not configured in environment variables');
            return NextResponse.json(
                { success: false, error: 'Vault address not configured' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            address: vaultAddress
        });
    } catch (error: any) {
        console.error('Error retrieving vault address:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
