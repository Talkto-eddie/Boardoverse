// import { PublicKey } from "@solana/web3.js";
// import { AppConstants } from "./app_constants";

// const connection = AppConstants.APP_CONNECTION;

// export async function getAssetBalance(
//     currencyInfo: SupportCurrency, 
//     publicKey: PublicKey): Promise<number> {
//     // Find the supported currency
//     // const  = supportedCurrencies.find((c) => c.name === currency);

//     // if (!currencyInfo) {
//     //     throw new Error(`Currency ${currency} is not supported`);
//     // }
//     // const publicKey = new PublicKey("srRAiQskYWBCDAZ4ftUDHKg54PNYhNoYx9gZzTKP47V");

//     if (currencyInfo.name === 'SOL') {
//         // Fetch SOL balance directly
//         const solBalanceLamports = await connection.getBalance(publicKey);
//         const solBalance = solBalanceLamports / 1_000_000_000; // Convert from lamports to SOL
        
//         return parseFloat(solBalance.toFixed(4));
//     } else {
//         // Fetch SPL token balance for USDC, USDT, SEND, etc.
//         const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
//             publicKey,
//             { mint: new PublicKey(currencyInfo.address) }
//         );
//         console.log("cruuuuu");
//         console.log(tokenAccounts);

//         if (tokenAccounts.value.length === 0) {
//             return 0; // If no token accounts are found, return 0 balance
//         }

//         // Get the token balance (assuming there's only one account for simplicity)
//         const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
//         const tokenBalance = tokenAccountInfo.tokenAmount.amount;
//         const tokenDecimals = tokenAccountInfo.tokenAmount.decimals;

//         const balance = tokenBalance / Math.pow(10, tokenDecimals);
        
//         console.log(parseFloat(balance.toFixed(6)));
        
//         // Convert to human-readable token balance
//         return parseFloat(balance.toFixed(4));
//     }
// }
