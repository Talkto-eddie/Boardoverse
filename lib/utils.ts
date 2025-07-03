import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AppConstants } from "./app_constants";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWalletAddress(address: string) {
  return address.slice(0, 6) + "......." + address.slice(address.length - 5, address.length);
}

export async function fetchUserWalletBalance(walletAddress: string): Promise<number>{
  try {
    const connection = AppConstants.APP_CONNECTION;
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}