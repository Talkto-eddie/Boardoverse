import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { assert } from "chai";
import { Boardoverse } from "../types/boardoverse";

describe('boardoverse', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Boardoverse as Program<Boardoverse>;


  // Test accounts
  let creator: anchor.web3.Keypair;
  let mint: PublicKey;
  let creatorTokenAccount: PublicKey;
  let gamePDA: PublicKey;
  let gameTokenAccountPDA: PublicKey;
  const gameId = "test-game-1";
  const amountToStake = new anchor.BN(1000);
  let player2: anchor.web3.Keypair;


  before(async () => {
    creator = anchor.web3.Keypair.generate();
    player2 = anchor.web3.Keypair.generate();


    await fundWallet(creator.publicKey, provider.connection)

    // Create a test mint
    mint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      9
    );

    // Create token account for creator
    // Create contributor token account and mint tokens
    creatorTokenAccount = await getAssociatedTokenAddress(
      mint,
      creator.publicKey
    );
    await createAssociatedTokenAccount(
      provider.connection,
      creator,
      mint,
      creator.publicKey
    );
    await mintTo(
      provider.connection,
      creator,
      mint,
      creatorTokenAccount,
      creator.publicKey,
      1000000000 // 1,000,000,000 tokens
    );

    // Find PDA for game account
    [gamePDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("BOARDOVERSE"),
        creator.publicKey.toBuffer(),
        Buffer.from(gameId),
      ],
      program.programId
    );

    // Find PDA for game token account
    [gameTokenAccountPDA] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("BOARDOVERSE"),
        mint.toBuffer(),
        gamePDA.toBuffer(),
      ],
      program.programId
    );
  });

  it('should start a game successfully', async () => {
    await program.methods.startGame(
      gameId,
      amountToStake
    )
      .accountsPartial({
        creator: creator.publicKey,
        game: gamePDA,
        gameTokenAccount: gameTokenAccountPDA,
        creatorTokenAccount: creatorTokenAccount,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Fetch the created game account
    const gameAccount = await program.account.game.fetch(gamePDA);

    // Verify game account data
    assert.equal(gameAccount.creator.toString(), creator.publicKey.toString());
    assert.equal(gameAccount.gameId, gameId);
    assert.equal(gameAccount.totalStake.toString(), amountToStake.toString());
    assert.equal(gameAccount.isActive, true);
    assert.ok(gameAccount.createdAt);
    assert.equal(gameAccount.winner, null);
  });

  it('should end a game successfully', async () => {
    // Create a winner token account
    const winner = creator;
    const winnerTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      winner,
      mint,
      winner.publicKey
    );

    // Create a destination account (could be same as winner for testing)
    const destinationAccount = winnerTokenAccount.address;

    await program.methods.endGame(winner.publicKey)
      .accountsPartial({
        creator: creator.publicKey,
        game: gamePDA,
        gameTokenAccount: gameTokenAccountPDA,
        winnerTokenAccount: winnerTokenAccount.address,
        destinationAccount: destinationAccount,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Fetch the game account after ending
    const gameAccount = await program.account.game.fetch(gamePDA);

    // Verify game was ended correctly
    assert.equal(gameAccount.isActive, false);
    assert.ok(gameAccount.endedAt);
  });

  // it('should fail to end game with invalid winner', async () => {
  //   const invalidWinner = anchor.web3.Keypair.generate(); // Random invalid winner

  //   const invalidWinnerTokenAccount = await getOrCreateAssociatedTokenAccount(
  //     provider.connection,
  //     creator,
  //     mint,
  //     invalidWinner.publicKey
  //   );

  //   try {
  //     await program.methods.endGame(invalidWinner.publicKey)
  //       .accountsPartial({
  //         creator: creator.publicKey,
  //         game: gamePDA,
  //         gameTokenAccount: gameTokenAccountPDA,
  //         winnerTokenAccount: invalidWinnerTokenAccount.address, // Using creator as winner account for test
  //         destinationAccount: creatorTokenAccount,
  //         mint: mint,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([creator])
  //       .rpc();
  //     assert.fail("Should have thrown an error");
  //   } catch (err) {
  //     console.log(err);
  //     assert.include(err.message, "InvalidWinner");
  //   }
  // });

  // it('should fail to end game when not active', async () => {
  //   // Game was already ended in previous test

  //   try {
  //     await program.methods.endGame(provider.wallet.publicKey)
  //       .accountsPartial({
  //         creator: creator.publicKey,
  //         game: gamePDA,
  //         gameTokenAccount: gameTokenAccountPDA,
  //         winnerTokenAccount: creatorTokenAccount,
  //         destinationAccount: creatorTokenAccount,
  //         mint: mint,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([creator])
  //       .rpc();
  //     assert.fail("Should have thrown an error");
  //   } catch (err) {
  //     console.log(err);
  //     assert.include(err.message, "GameNotActive");
  //   }
  // });

  // it('should fail to end game with invalid creator', async () => {
  //   // Create a new game to test
  //   const newGameId = "invalid-creator-test";
  //   const [newGamePDA] = await PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("BOARDOVERSE"),
  //       provider.wallet.publicKey.toBuffer(),
  //       Buffer.from(newGameId),
  //     ],
  //     program.programId
  //   );

  //   await program.methods.startGame(
  //     newGameId,
  //     amountToStake,
  //     creator.publicKey,
  //     player2.publicKey
  //   )
  //     .accountsPartial({
  //       creator: creator.publicKey,
  //       game: newGamePDA,
  //       gameTokenAccount: gameTokenAccountPDA,
  //       creatorTokenAccount: creatorTokenAccount,
  //       mint: mint,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([creator])
  //     .rpc();

  //   // Try to end with different creator
  //   const fakeCreator = anchor.web3.Keypair.generate();

  //   try {
  //     await program.methods.endGame(creator.publicKey)
  //       .accountsPartial({
  //         creator: fakeCreator.publicKey,
  //         game: newGamePDA,
  //         gameTokenAccount: gameTokenAccountPDA,
  //         winnerTokenAccount: creatorTokenAccount,
  //         destinationAccount: creatorTokenAccount,
  //         mint: mint,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([fakeCreator])
  //       .rpc();
  //     assert.fail("Should have thrown an error");
  //   } catch (err) {
  //     console.log(err);
  //     assert.include(err.message, "InvalidGameCreator");
  //   }
  // });
});




const fundWallet = async (pubKey: PublicKey, connection: Connection) => {
  const signature = await connection.requestAirdrop(
    pubKey,
    10 * LAMPORTS_PER_SOL
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature
    },
    "confirmed"
  );
}