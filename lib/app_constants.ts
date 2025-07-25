import { Connection, Keypair, PublicKey } from "@solana/web3.js";

/**
 * Application-wide constants
 */
export class AppConstants {
  /**
   * The name of the application
   */
  public static readonly APP_NAME = "BoardoVerse - Web3 Ludo Game";

  public static readonly ARBITER_PUBKEY = new PublicKey("C3eAN9KaMwTnGfepxLwQiirGExLbxPJzaPsJDEHbE2Fk");

  /**
   * The description of the application
   */
  public static readonly APP_DESCRIPTION = "Stake tokens and play Ludo to win in this Web3 gaming platform";

  public static readonly APP_URL = "https://boardoverse.xyz"

  public static readonly APP_SOL_ENDPOINT = "https://rpc.gorbagana.wtf/";
  // "https://devnet.helius-rpc.com/?api-key=" + process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  // https://mainnet.helius-rpc.com/?api-key=ammmmmm

  public static readonly APP_CONNECTION: Connection = new Connection(AppConstants.APP_SOL_ENDPOINT, "confirmed");

  public static readonly APP_SUPPORTED_CURRENCY = {
    name: "SOL",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9
  };
  
  static readonly EXPLORER_URL: string = "https://explorer.gorbagana.wtf/";//"https://solscan.io";
}
