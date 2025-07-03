import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import BoardoverseIDL from '../idl/boardoverse.json'
import type { Boardoverse } from '../types/boardoverse'

// Re-export the generated IDL and type
export { Boardoverse, BoardoverseIDL }

// The programId is imported from the program IDL.
export const BOARD_O_VERSE_PROGRAM_ID = new PublicKey(BoardoverseIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getBoardoverseProgram(provider: AnchorProvider) {
  return new Program(BoardoverseIDL as Boardoverse, provider)
}
