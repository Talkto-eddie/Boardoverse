import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function formatWalletAddress(address: string) {
  return address.slice(0, 6) + "......." + address.slice(address.length - 5, address.length);
}