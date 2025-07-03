import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          game_id: string
          creator_wallet: string
          stake_amount: number
          status: 'waiting' | 'playing' | 'finished' | 'cancelled'
          vs_computer: boolean
          max_players: number
          current_players: number
          winner_wallet: string | null
          transaction_signature: string | null
          blockchain_confirmed: boolean
          created_at: string
          started_at: string | null
          finished_at: string | null
          updated_at: string
        }
        Insert: {
          game_id: string
          creator_wallet: string
          stake_amount: number
          vs_computer?: boolean
          status?: 'waiting' | 'playing' | 'finished' | 'cancelled'
          max_players?: number
          current_players?: number
          winner_wallet?: string | null
          transaction_signature?: string | null
          blockchain_confirmed?: boolean
          started_at?: string | null
          finished_at?: string | null
        }
        Update: {
          status?: 'waiting' | 'playing' | 'finished' | 'cancelled'
          current_players?: number
          winner_wallet?: string | null
          transaction_signature?: string | null
          blockchain_confirmed?: boolean
          started_at?: string | null
          finished_at?: string | null
          updated_at?: string
        }
      }
      game_players: {
        Row: {
          id: string
          game_id: string
          player_wallet: string
          colors: string[]
          player_index: number
          is_ready: boolean
          is_active: boolean
          joined_at: string
          last_action_at: string
        }
        Insert: {
          game_id: string
          player_wallet: string
          colors: string[]
          player_index: number
          is_ready?: boolean
          is_active?: boolean
        }
        Update: {
          colors?: string[]
          is_ready?: boolean
          is_active?: boolean
          last_action_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          game_id: string
          tokens: any[] // JSON array
          dice: number[]
          current_player_wallet: string
          current_player_index: number
          turn_start_time: string
          last_roll_time: string | null
          last_roll_player: string | null
          winner: string | null
          game_over: boolean
          turn_count: number
          updated_at: string
        }
        Insert: {
          game_id: string
          tokens: any[]
          dice?: number[]
          current_player_wallet: string
          current_player_index?: number
          turn_start_time?: string
          last_roll_time?: string | null
          last_roll_player?: string | null
          winner?: string | null
          game_over?: boolean
          turn_count?: number
        }
        Update: {
          tokens?: any[]
          dice?: number[]
          current_player_wallet?: string
          current_player_index?: number
          turn_start_time?: string
          last_roll_time?: string | null
          last_roll_player?: string | null
          winner?: string | null
          game_over?: boolean
          turn_count?: number
          updated_at?: string
        }
      }
      game_moves: {
        Row: {
          id: string
          game_id: string
          player_wallet: string
          move_type: 'dice_roll' | 'token_move' | 'skip_turn'
          token_id: string | null
          from_position: number | null
          to_position: number | null
          dice_value: number | null
          captured_tokens: string[]
          is_winning_move: boolean
          timestamp: string
          turn_number: number
        }
        Insert: {
          game_id: string
          player_wallet: string
          move_type: 'dice_roll' | 'token_move' | 'skip_turn'
          token_id?: string | null
          from_position?: number | null
          to_position?: number | null
          dice_value?: number | null
          captured_tokens?: string[]
          is_winning_move?: boolean
          turn_number: number
        }
        Update: {
          captured_tokens?: string[]
          is_winning_move?: boolean
        }
      }
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string | null
          avatar_url: string | null
          total_games_played: number
          total_games_won: number
          total_earnings: number
          created_at: string
          updated_at: string
          last_seen: string
          status: 'online' | 'offline' | 'in_game'
        }
        Insert: {
          wallet_address: string
          username?: string | null
          avatar_url?: string | null
          total_games_played?: number
          total_games_won?: number
          total_earnings?: number
          status?: 'online' | 'offline' | 'in_game'
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
          total_games_played?: number
          total_games_won?: number
          total_earnings?: number
          last_seen?: string
          status?: 'online' | 'offline' | 'in_game'
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_signature: string
          game_id: string
          transaction_type: 'stake' | 'reward' | 'refund'
          from_wallet: string
          to_wallet: string
          amount: number
          token_type: 'USDC' | 'SOL'
          status: 'pending' | 'confirmed' | 'failed'
          block_height: number | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          transaction_signature: string
          game_id: string
          transaction_type: 'stake' | 'reward' | 'refund'
          from_wallet: string
          to_wallet: string
          amount: number
          token_type: 'USDC' | 'SOL'
          status?: 'pending' | 'confirmed' | 'failed'
          block_height?: number | null
          confirmed_at?: string | null
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'failed'
          block_height?: number | null
          confirmed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_status: 'waiting' | 'playing' | 'finished' | 'cancelled'
      user_status: 'online' | 'offline' | 'in_game'
      transaction_status: 'pending' | 'confirmed' | 'failed'
      transaction_type: 'stake' | 'reward' | 'refund'
      move_type: 'dice_roll' | 'token_move' | 'skip_turn'
    }
  }
}

// Typed client
export type TypedSupabaseClient = typeof supabase

// Helper function to get typed client
export const getSupabaseClient = () => supabase

// Real-time helpers
export const subscribeToGameUpdates = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'game_states',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe()
}

export const subscribeToGameMoves = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`moves:${gameId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'game_moves',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe()
}

// Game utilities
export const isGameFull = async (gameId: string): Promise<boolean> => {
  const { data: game } = await supabase
    .from('games')
    .select('current_players, max_players')
    .eq('game_id', gameId)
    .single()
  
  return game ? game.current_players >= game.max_players : false
}

export const getGamePlayers = async (gameId: string) => {
  return await supabase
    .from('game_players')
    .select('*')
    .eq('game_id', gameId)
    .order('player_index')
}

export const getCurrentGameState = async (gameId: string) => {
  return await supabase
    .from('game_states')
    .select('*')
    .eq('game_id', gameId)
    .single()
}

// Error handling helper
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase error during ${operation}:`, error)
  
  if (error?.code === 'PGRST116') {
    throw new Error('Record not found')
  } else if (error?.code === '23505') {
    throw new Error('Record already exists')
  } else if (error?.code === '23503') {
    throw new Error('Invalid reference')
  } else {
    throw new Error(error?.message || `Failed to ${operation}`)
  }
}

export default supabase