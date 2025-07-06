// lib/supabase-game-manager.ts
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface BoardPaths {
    commonPath: {
        type: "path";
        coords: [number, number][];
        length: number;
        next: number[];
        prev: number[];
    };
    homePaths: {
        [color: string]: {
            type: "homepath";
            coords: [number, number][];
            length: number;
            entryPoint: number;
        };
    };
    safeZones: {
        type: "safezone";
        coords: [number, number][];
        color: string;
    }[];
    homeBases: {
        [color: string]: {
            type: "homebase";
            coords: [number, number][];
        };
    };
    startAreas: {
        [color: string]: {
            type: "startarea";
            coords: [number, number][];
        };
    };
    center: { type: "center"; coords: [number, number][] };
}

export interface TokenState {
    id: string;           // "RED-0"
    color: string;        // "RED" | "GREEN" | "YELLOW" | "BLUE"
    x: number;
    y: number;
    position: number;
    index: number;        // 0-3
    isClickable: boolean;
}

export interface GameState {
    tokens: TokenState[];
    dice: number[];
    myTurn: boolean;
    gameOver: boolean;
    winner: number | null;
    currentPlayerWallet?: string;
    turnStartTime?: string;
}

interface CreateOrJoinResponse {
    gameId: string;
    playerId: string;
    colors: string[];
    error?: string;
}

interface DiceRollData {
    playerId: number;
    playerWallet: string;
    dice: number[];
    gameId: string;
    timestamp: string;
}

interface GameMove {
    gameId: string;
    playerWallet: string;
    tokenId: string;
    fromPosition: number;
    toPosition: number;
    diceValue: number;
    timestamp: string;
}

class SupabaseGameManager {
    private channels: Map<string, RealtimeChannel> = new Map();
    private eventCallbacks: Map<string, Function[]> = new Map();

    // Create a new game
    createGame = async (
        vsComputer = false,
        playerWallet: string,
        stakeAmount: number
    ): Promise<CreateOrJoinResponse> => {
        try {
            // 1. Create game record
            const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .insert({
                    game_id: gameId,
                    creator_wallet: playerWallet,
                    stake_amount: stakeAmount,
                    vs_computer: vsComputer,
                    status: 'waiting',
                    max_players: vsComputer ? 1 : 2
                })
                .select()
                .single();

            if (gameError) throw gameError;

            // 2. Add creator as first player
            const playerColor = 'RED';
            const { error: playerError } = await supabase
                .from('game_players')
                .insert({
                    game_id: gameId,  // Use the string game_id, not the UUID
                    player_wallet: playerWallet,
                    colors: [playerColor],
                    is_ready: true,
                    player_index: 0
                });

            if (playerError) throw playerError;

            // 3. Initialize game state
            const initialTokens = this.generateInitialTokens([playerColor]);
            const { error: stateError } = await supabase
                .from('game_states')
                .insert({
                    game_id: gameId,  // Use the string game_id, not the UUID
                    tokens: initialTokens,
                    dice: [],
                    current_player_index: 0,
                    current_player_wallet: playerWallet,
                    turn_start_time: new Date().toISOString()
                });

            if (stateError) throw stateError;

            // 4. Store board paths
            const boardPaths = this.generateBoardPaths();
            await supabase
                .from('game_board_data')
                .insert({
                    game_id: gameId,  // Use the string game_id, not the UUID
                    board_paths: boardPaths
                });

            return {
                gameId: gameId,
                playerId: playerWallet,
                colors: [playerColor]
            };

        } catch (error: any) {
            return {
                gameId: '',
                playerId: '',
                colors: [],
                error: error.message
            };
        }
    };

    // Join an existing game
    joinGame = async (gameId: string, playerWallet: string): Promise<CreateOrJoinResponse> => {
        try {
            // 1. First check if player is already in this game
            const { data: existingPlayerData } = await supabase
                .from('game_players')
                .select('player_wallet, colors')
                .eq('game_id', gameId)
                .eq('player_wallet', playerWallet)
                .single();

            if (existingPlayerData) {
                console.log('Player already in game, returning existing data');
                return {
                    gameId: gameId,
                    playerId: playerWallet,
                    colors: existingPlayerData.colors
                };
            }

            // 2. Get game data
            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .select(`
          *,
          game_players (*)
        `)
                .eq('game_id', gameId);

            if (gameError) {
                throw gameError;
            }

            // If no game found, create a new one
            if (!gameData || gameData.length === 0) {
                console.log(`Game ${gameId} not found, creating new game...`);
                return await this.createGame(false, playerWallet, 0);
            }

            // If multiple games found, take the first one (shouldn't happen with unique game_ids)
            const game = gameData[0];

            if (game.status !== 'waiting') {
                throw new Error('Game is not accepting new players');
            }

            if (game.game_players.length >= game.max_players) {
                throw new Error('Game is full');
            }

            // Double-check if player already in game (redundant but safe)
            const existingPlayer = game.game_players.find(
                (p: any) => p.player_wallet === playerWallet
            );

            if (existingPlayer) {
                console.log('Player found in game data, returning existing data');
                return {
                    gameId: gameId,
                    playerId: playerWallet,
                    colors: existingPlayer.colors
                };
            }

            // 3. Assign color to new player
            const usedColors = game.game_players.flatMap((p: any) => p.colors);
            const availableColors = ['GREEN', 'YELLOW', 'BLUE'].filter(
                color => !usedColors.includes(color)
            );

            if (availableColors.length === 0) {
                throw new Error('No available colors');
            }

            const playerColor = availableColors[0];
            const playerIndex = game.game_players.length;

            // 4. Add player to game
            const { error: playerError } = await supabase
                .from('game_players')
                .insert({
                    game_id: gameId,  // Use the string game_id, not the UUID
                    player_wallet: playerWallet,
                    colors: [playerColor],
                    is_ready: true,
                    player_index: playerIndex
                });

            if (playerError) throw playerError;

            // 5. Update game state with new player's tokens
            const { data: currentState } = await supabase
                .from('game_states')
                .select('tokens')
                .eq('game_id', gameId)  // Use the string game_id
                .single();

            const newTokens = this.generateInitialTokens([playerColor]);
            const updatedTokens = [...(currentState?.tokens || []), ...newTokens];

            await supabase
                .from('game_states')
                .update({ tokens: updatedTokens })
                .eq('game_id', gameId);  // Use the string game_id

            // 6. Start game if full and update the game state properly
            const totalPlayers = game.game_players.length + 1;
            if (totalPlayers >= game.max_players) {
                // Update game status to playing
                await supabase
                    .from('games')
                    .update({
                        status: 'playing',
                        started_at: new Date().toISOString()
                    })
                    .eq('game_id', gameId);

                // Set the first player as current player if not already set
                const { data: currentGameState } = await supabase
                    .from('game_states')
                    .select('current_player_wallet')
                    .eq('game_id', gameId)
                    .single();

                if (!currentGameState?.current_player_wallet) {
                    // Set the first player (creator) as the current player
                    await supabase
                        .from('game_states')
                        .update({
                            current_player_wallet: game.creator_wallet,
                            turn_start_time: new Date().toISOString()
                        })
                        .eq('game_id', gameId);
                }

                console.log(`Game ${gameId} is now playing with ${totalPlayers} players`);
            }

            return {
                gameId: gameId,
                playerId: playerWallet,
                colors: [playerColor]
            };

        } catch (error: any) {
            return {
                gameId: '',
                playerId: '',
                colors: [],
                error: error.message
            };
        }
    };

    // Get game data
    getGameData = async (gameId: string) => {
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('game_id', gameId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching game data:', error);
            throw error;
        }
    };

    // Get board paths for a game
    getBoardPaths = async (gameId: string): Promise<BoardPaths> => {
        try {
            const { data } = await supabase
                .from('game_board_data')
                .select('board_paths')
                .eq('game_id', gameId)  // Use the string game_id directly
                .single();

            return data?.board_paths || this.generateBoardPaths();
        } catch (error) {
            console.warn('Failed to fetch board paths:', error);
            return this.generateBoardPaths();
        }
    };

    // Roll dice
    rollDice = async (gameId: string, playerWallet: string): Promise<number> => {
        try {
            // 1. Verify it's player's turn
            const { data: gameState } = await supabase
                .from('game_states')
                .select('current_player_wallet, game_id, dice, tokens')
                .eq('game_id', gameId)
                .single();

            if (gameState?.current_player_wallet !== playerWallet) {
                throw new Error('Not your turn');
            }

            // 2. Check if dice has already been rolled for this turn
            if (gameState.dice && gameState.dice.length > 0) {
                throw new Error('Dice already rolled for this turn');
            }

            // 3. Generate dice roll
            const diceValue = Math.floor(Math.random() * 6) + 1;
            const rollData: DiceRollData = {
                playerId: 0, // Will be updated with actual player index
                playerWallet,
                dice: [diceValue],
                gameId,
                timestamp: new Date().toISOString()
            };

            // 4. Update game state with atomic transaction
            const { data: updateResult, error: updateError } = await supabase
                .from('game_states')
                .update({
                    dice: [diceValue],
                    last_roll_time: new Date().toISOString(),
                    last_roll_player: playerWallet
                })
                .eq('game_id', gameState.game_id)
                .eq('current_player_wallet', playerWallet) // Double-check it's still their turn
                .select();

            if (updateError) {
                console.error('Error updating game state:', updateError);
                throw updateError;
            }

            if (!updateResult || updateResult.length === 0) {
                throw new Error('Failed to update game state - not your turn or game state changed');
            }

            console.log(`Dice rolled successfully: ${diceValue} for player ${playerWallet}`);

            // 5. Record the move
            await supabase
                .from('game_moves')
                .insert({
                    game_id: gameState.game_id,
                    player_wallet: playerWallet,
                    move_type: 'dice_roll',
                    dice_value: diceValue,
                    timestamp: new Date().toISOString()
                });

            // 6. Update token clickability based on dice value and current positions
            if (gameState.tokens) {
                const updatedTokens = await this.updateTokenClickability(gameState.tokens, diceValue, playerWallet, gameId);
                await supabase
                    .from('game_states')
                    .update({ tokens: updatedTokens })
                    .eq('game_id', gameState.game_id);
            }

            console.log('Dice rolled successfully:', diceValue);
            return diceValue;

        } catch (error) {
            console.error('Failed to roll dice:', error);
            throw error;
        }
    };

    // Play a roll (move token)
    playRoll = async (
        tokenId: string,
        rolledValue: number,
        gameId: string,
        playerWallet: string
    ): Promise<void> => {
        try {
            // 1. Get current game state
            const { data: gameState } = await supabase
                .from('game_states')
                .select('tokens, current_player_wallet, game_id, dice')
                .eq('game_id', gameId)
                .single();

            if (!gameState) {
                throw new Error('Game not found');
            }

            if (gameState.current_player_wallet !== playerWallet) {
                throw new Error('Not your turn');
            }

            // Verify dice value matches
            if (!gameState.dice || gameState.dice.length === 0 || gameState.dice[0] !== rolledValue) {
                throw new Error('Invalid dice value');
            }

            // 2. Calculate new token position
            const currentTokens = gameState.tokens || [];
            const tokenIndex = currentTokens.findIndex((t: TokenState) => t.id === tokenId);

            if (tokenIndex === -1) {
                throw new Error('Token not found');
            }

            const token = currentTokens[tokenIndex];
            const newPosition = token.position + rolledValue;

            // 3. Validate move (add your game logic here)
            if (!this.isValidMove(token, newPosition, currentTokens)) {
                throw new Error('Invalid move');
            }

            // 4. Update token position
            const updatedTokens = [...currentTokens];
            updatedTokens[tokenIndex] = {
                ...token,
                position: newPosition,
                x: this.calculateXFromPosition(newPosition, token.color),
                y: this.calculateYFromPosition(newPosition, token.color),
                isClickable: false // Reset clickability after move
            };

            // 5. Determine if player gets extra turn (rolled a 6)
            const extraTurn = rolledValue === 6;
            const nextPlayer = extraTurn ? playerWallet : await this.getNextPlayer(gameId, playerWallet);

            // 6. Check for captures, wins, etc.
            const gameLogic = this.processGameLogic(updatedTokens, playerWallet);

            // 7. Update game state - clear dice and change turn if necessary
            await supabase
                .from('game_states')
                .update({
                    tokens: updatedTokens,
                    dice: [], // Clear dice after move
                    current_player_wallet: extraTurn ? playerWallet : nextPlayer,
                    turn_start_time: new Date().toISOString(),
                    winner: gameLogic.winner,
                    game_over: gameLogic.gameOver
                })
                .eq('game_id', gameState.game_id);

            // 8. Record the move
            await supabase
                .from('game_moves')
                .insert({
                    game_id: gameState.game_id,
                    player_wallet: playerWallet,
                    move_type: 'token_move',
                    token_id: tokenId,
                    from_position: token.position,
                    to_position: newPosition,
                    dice_value: rolledValue,
                    extra_turn: extraTurn,
                    timestamp: new Date().toISOString()
                });

            console.log(`Move completed: ${tokenId} from ${token.position} to ${newPosition}${extraTurn ? ' (extra turn!)' : ''}`);

        } catch (error) {
            console.error('Failed to play roll:', error);
            throw error;
        }
    };

    // Skip turn
    skipTurn = async (gameId: string, playerWallet: string): Promise<void> => {
        try {
            const { data: gameState } = await supabase
                .from('game_states')
                .select('current_player_wallet, game_id')
                .eq('game_id', gameId)
                .single();

            if (gameState?.current_player_wallet !== playerWallet) {
                throw new Error('Not your turn');
            }

            // Get next player
            const nextPlayer = await this.getNextPlayer(gameState.game_id, playerWallet);

            await supabase
                .from('game_states')
                .update({
                    current_player_wallet: nextPlayer,
                    dice: [],
                    turn_start_time: new Date().toISOString()
                })
                .eq('game_id', gameState.game_id);

            // Record the skip
            await supabase
                .from('game_moves')
                .insert({
                    game_id: gameState.game_id,
                    player_wallet: playerWallet,
                    move_type: 'skip_turn',
                    timestamp: new Date().toISOString()
                });

        } catch (error) {
            console.error('Failed to skip turn:', error);
            throw error;
        }
    };

    // Cancel/stop a game
    cancelGame = async (gameId: string, playerWallet: string): Promise<void> => {
        try {
            // 1. Check if the player is authorized to cancel the game
            const { data: gameData } = await supabase
                .from('games')
                .select('creator_wallet, status')
                .eq('game_id', gameId)
                .single();

            if (!gameData) {
                throw new Error('Game not found');
            }

            // Only the creator can cancel the game, or any player if game is in progress
            if (gameData.creator_wallet !== playerWallet && gameData.status === 'waiting') {
                throw new Error('Only the game creator can cancel a waiting game');
            }

            // 2. Update game status to cancelled/finished
            const { error: updateError } = await supabase
                .from('games')
                .update({
                    status: 'finished',
                    finished_at: new Date().toISOString(),
                    winner_wallet: null // No winner for cancelled games
                })
                .eq('game_id', gameId);

            if (updateError) throw updateError;

            // 3. Update game state to reflect cancellation
            await supabase
                .from('game_states')
                .update({
                    game_over: true,
                    winner: null,
                    current_player_wallet: null
                })
                .eq('game_id', gameId);

            // 4. Record the cancellation move
            await supabase
                .from('game_moves')
                .insert({
                    game_id: gameId,
                    player_wallet: playerWallet,
                    move_type: 'game_cancelled',
                    timestamp: new Date().toISOString()
                });

            console.log(`Game ${gameId} cancelled by player ${playerWallet}`);

        } catch (error) {
            console.error('Failed to cancel game:', error);
            throw error;
        }
    };

    // Leave a game (for non-creators)
    leaveGame = async (gameId: string, playerWallet: string): Promise<void> => {
        try {
            // 1. Check if the player is in the game
            const { data: playerData } = await supabase
                .from('game_players')
                .select('*')
                .eq('game_id', gameId)
                .eq('player_wallet', playerWallet)
                .single();

            if (!playerData) {
                throw new Error('Player not in this game');
            }

            // 2. Check game status
            const { data: gameData } = await supabase
                .from('games')
                .select('creator_wallet, status')
                .eq('game_id', gameId)
                .single();

            if (!gameData) {
                throw new Error('Game not found');
            }

            // 3. If player is creator or game only has 1 player, cancel the entire game
            if (gameData.creator_wallet === playerWallet || gameData.status === 'waiting') {
                await this.cancelGame(gameId, playerWallet);
                return;
            }

            // 4. Otherwise, remove player from game
            await supabase
                .from('game_players')
                .delete()
                .eq('game_id', gameId)
                .eq('player_wallet', playerWallet);

            // 5. Update game state if game was in progress
            if (gameData.status === 'playing') {
                await supabase
                    .from('games')
                    .update({
                        status: 'finished',
                        finished_at: new Date().toISOString(),
                        winner_wallet: null // No winner if someone leaves
                    })
                    .eq('game_id', gameId);
            }

            // 6. Record the leave action
            await supabase
                .from('game_moves')
                .insert({
                    game_id: gameId,
                    player_wallet: playerWallet,
                    move_type: 'player_left',
                    timestamp: new Date().toISOString()
                });

            console.log(`Player ${playerWallet} left game ${gameId}`);

        } catch (error) {
            console.error('Failed to leave game:', error);
            throw error;
        }
    };

    // Subscribe to real-time updates
    subscribeToGame = (gameId: string): RealtimeChannel => {
        if (this.channels.has(gameId)) {
            return this.channels.get(gameId)!;
        }

        const channel = supabase.channel(`game:${gameId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'game_states',
                    filter: `game_id=eq.${gameId}`
                },
                (payload) => {
                    this.triggerCallbacks('gameStateUpdated', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'game_moves',
                    filter: `game_id=eq.${gameId}`
                },
                (payload) => {
                    if (payload.new && (payload.new as any).move_type === 'dice_roll') {
                        this.triggerCallbacks('diceRolled', {
                            playerId: 0,
                            playerWallet: (payload.new as any).player_wallet,
                            dice: [(payload.new as any).dice_value],
                            gameId: gameId,
                            timestamp: (payload.new as any).timestamp
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'game_players',
                    filter: `game_id=eq.${gameId}`
                },
                (payload) => {
                    this.triggerCallbacks('playerJoined', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'games',
                    filter: `game_id=eq.${gameId}`
                },
                (payload) => {
                    this.triggerCallbacks('gameUpdated', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'game_players'
                },
                () => {
                    this.triggerCallbacks('playerDisconnected', {});
                }
            );

        channel.subscribe();
        this.channels.set(gameId, channel);
        return channel;
    };

    // Connection management
    connect = (): (() => void) => {
        // Supabase handles connection automatically
        return () => this.disconnect();
    };

    disconnect = (): void => {
        // Clean up channels
        this.channels.forEach(channel => {
            channel.unsubscribe();
        });
        this.channels.clear();
    };

    // Event handlers (simplified for now)
    onGameStateUpdated = (cb: (state: any) => void): (() => void) => {
        this.addCallback('gameStateUpdated', cb);
        return () => this.removeCallback('gameStateUpdated', cb);
    };

    onDiceRolled = (cb: (data: DiceRollData) => void): (() => void) => {
        this.addCallback('diceRolled', cb);
        return () => this.removeCallback('diceRolled', cb);
    };

    onPlayerJoined = (cb: (data: any) => void): (() => void) => {
        this.addCallback('playerJoined', cb);
        return () => this.removeCallback('playerJoined', cb);
    };

    onGameUpdated = (cb: (data: any) => void): (() => void) => {
        this.addCallback('gameUpdated', cb);
        return () => this.removeCallback('gameUpdated', cb);
    };

    onError = (cb: (err: { message: string }) => void): (() => void) => {
        this.addCallback('error', cb);
        return () => this.removeCallback('error', cb);
    };

    private addCallback = (event: string, callback: Function): void => {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event)!.push(callback);
    };

    private removeCallback = (event: string, callback: Function): void => {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    };

    private triggerCallbacks = (event: string, data: any): void => {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    };

    private broadcastToChannel = async (gameId: string, event: string, data: any): Promise<void> => {
        // Supabase handles broadcasting through real-time subscriptions
        // This is automatically done when we update the database
    };

    private generateInitialTokens = (colors: string[]): TokenState[] => {
        const tokens: TokenState[] = [];
        colors.forEach(color => {
            const homePositions = this.getHomePositions(color);
            for (let i = 0; i < 4; i++) {
                tokens.push({
                    id: `${color}-${i}`,
                    color: color,
                    x: homePositions[i].x,
                    y: homePositions[i].y,
                    position: -1, // Home position
                    index: i,
                    isClickable: true // Can be moved if dice shows 6
                });
            }
        });
        return tokens;
    };

    private getHomePositions = (color: string): {x: number, y: number}[] => {
        switch (color.toUpperCase()) {
            case 'RED':
                return [{x: 1, y: 1}, {x: 3, y: 1}, {x: 1, y: 3}, {x: 3, y: 3}];
            case 'GREEN':
                return [{x: 1, y: 10}, {x: 3, y: 10}, {x: 1, y: 12}, {x: 3, y: 12}];
            case 'YELLOW':
                return [{x: 10, y: 10}, {x: 12, y: 10}, {x: 10, y: 12}, {x: 12, y: 12}];
            case 'BLUE':
                return [{x: 10, y: 1}, {x: 12, y: 1}, {x: 10, y: 3}, {x: 12, y: 3}];
            default:
                return [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        }
    };

    // Helper function to calculate X coordinate from position
    private calculateXFromPosition = (position: number, color: string): number => {
        if (position === -1) {
            // Token is in home, return home position
            const homePositions = this.getHomePositions(color);
            return homePositions[0].x; // Default to first home position
        }
        
        if (position >= 56) {
            // Token has reached center
            return 7;
        }
        
        if (position >= 50) {
            // Token is in home stretch
            const homeStretch = this.getHomeStretchPositions(color);
            const homeIndex = position - 50;
            if (homeIndex < homeStretch.length) {
                return homeStretch[homeIndex].x;
            }
        }
        
        // Token is on main path
        const mainPath = [
            [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
            [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
            [7, 0], [8, 0], [7, 1], [8, 1], [7, 2], [8, 2],
            [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
            [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
            [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6],
            [9, 6], [8, 6], [7, 6], [6, 6], [5, 6], [4, 6],
            [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], 
            [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8]
        ];
        
        if (position < mainPath.length) {
            return mainPath[position][0];
        }
        
        return 7; // Default to center
    };

    // Helper function to calculate Y coordinate from position  
    private calculateYFromPosition = (position: number, color: string): number => {
        if (position === -1) {
            // Token is in home, return home position
            const homePositions = this.getHomePositions(color);
            return homePositions[0].y; // Default to first home position
        }
        
        if (position >= 56) {
            // Token has reached center
            return 7;
        }
        
        if (position >= 50) {
            // Token is in home stretch
            const homeStretch = this.getHomeStretchPositions(color);
            const homeIndex = position - 50;
            if (homeIndex < homeStretch.length) {
                return homeStretch[homeIndex].y;
            }
        }
        
        // Token is on main path
        const mainPath = [
            [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
            [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
            [7, 0], [8, 0], [7, 1], [8, 1], [7, 2], [8, 2],
            [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
            [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
            [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6],
            [9, 6], [8, 6], [7, 6], [6, 6], [5, 6], [4, 6],
            [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], 
            [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8]
        ];
        
        if (position < mainPath.length) {
            return mainPath[position][1];
        }
        
        return 7; // Default to center
    };

    private getHomeStretchPositions = (color: string): {x: number, y: number}[] => {
        switch (color.toUpperCase()) {
            case 'RED':
                return [{x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}];
            case 'GREEN':
                return [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}];
            case 'YELLOW':
                return [{x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}, {x: 7, y: 8}];
            case 'BLUE':
                return [{x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}, {x: 8, y: 7}];
            default:
                return [];
        }
    };

    private generateBoardPaths = (): BoardPaths => {
        // Return your board path configuration
        return {
            commonPath: {
                type: "path",
                coords: [], // Your path coordinates
                length: 52,
                next: [],
                prev: []
            },
            homePaths: {},
            safeZones: [],
            homeBases: {},
            startAreas: {},
            center: { type: "center", coords: [] }
        };
    };

    private isValidMove = (token: TokenState, newPosition: number, allTokens: TokenState[]): boolean => {
        // Implement your game movement validation logic
        return true;
    };

    private processGameLogic = (tokens: TokenState[], currentPlayer: string) => {
        // Implement game logic (captures, wins, next player, etc.)
        return {
            nextPlayer: currentPlayer, // Calculate next player
            winner: null,
            gameOver: false
        };
    };

    private getNextPlayer = async (gameId: string, currentPlayer: string): Promise<string> => {
        const { data: players } = await supabase
            .from('game_players')
            .select('player_wallet, player_index')
            .eq('game_id', gameId)  // Use the string game_id
            .order('player_index');

        if (!players || players.length === 0) return currentPlayer;

        const currentIndex = players.findIndex(p => p.player_wallet === currentPlayer);
        const nextIndex = (currentIndex + 1) % players.length;
        return players[nextIndex].player_wallet;
    };

    private getHomeBaseX = (color: string, index: number): number => {
        const homePositions = this.getHomePositions(color);
        return homePositions[index] ? homePositions[index].x : 0;
    };

    private getHomeBaseY = (color: string, index: number): number => {
        const homePositions = this.getHomePositions(color);
        return homePositions[index] ? homePositions[index].y : 0;
    };

    private updateTokenClickability = async (tokens: TokenState[], diceValue: number, playerWallet: string, gameId: string): Promise<TokenState[]> => {
        // Get player colors
        const { data: playerData } = await supabase
            .from('game_players')
            .select('colors')
            .eq('player_wallet', playerWallet)
            .eq('game_id', gameId)
            .single();
            
        const playerColors = playerData?.colors || [];

        return tokens.map(token => {
            // Check if token belongs to current player
            const belongsToPlayer = playerColors.some((color: string) => 
                color.toUpperCase() === token.color.toUpperCase()
            );
            
            if (!belongsToPlayer) {
                return { ...token, isClickable: false };
            }
            
            // Check if token can move based on Ludo rules
            if (token.position === -1) {
                // Token is in home - needs a 6 to move out
                return { ...token, isClickable: diceValue === 6 };
            } else {
                // Token is on board - check if it can move forward
                const newPosition = token.position + diceValue;
                const canMove = newPosition <= 56; // Don't exceed winning position
                return { ...token, isClickable: canMove };
            }
        });
    };

    // Get complete game state including players, tokens, and current turn
    getCompleteGameState = async (gameId: string, playerWallet: string) => {
        try {
            // Get game info
            const { data: gameData } = await supabase
                .from('games')
                .select('*')
                .eq('game_id', gameId)
                .single();

            if (!gameData) {
                throw new Error('Game not found');
            }

            // Get all players
            const { data: playersData } = await supabase
                .from('game_players')
                .select('*')
                .eq('game_id', gameId)
                .order('player_index');

            // Get current game state
            const { data: gameStateData } = await supabase
                .from('game_states')
                .select('*')
                .eq('game_id', gameId)
                .single();

            // Determine current player info
            const currentPlayerData = playersData?.find(p => p.player_wallet === playerWallet);
            const currentPlayerIndex = gameStateData?.current_player_wallet 
                ? playersData?.findIndex(p => p.player_wallet === gameStateData.current_player_wallet) || 0
                : 0;

            return {
                game: gameData,
                players: playersData || [],
                gameState: gameStateData,
                currentPlayer: currentPlayerData,
                currentPlayerIndex,
                isMyTurn: gameStateData?.current_player_wallet === playerWallet
            };
        } catch (error) {
            console.error('Error fetching complete game state:', error);
            throw error;
        }
    };
}

export const supabaseGameManager = new SupabaseGameManager();