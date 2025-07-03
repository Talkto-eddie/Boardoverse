import { supabase } from './supabase';

export interface UserData {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  total_games_played: number;
  total_games_won: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export interface UserCheckResult {
  userData?: UserData;
  isNewUser: boolean;
  message: string;
  error?: string;
}

/**
 * Check if user exists in Supabase, create if not, update last_seen if exists
 */
export const checkAndSetupUser = async (walletAddress: string): Promise<UserCheckResult> => {
  try {
    console.log("Checking user in database:", walletAddress);

    // First, try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // If error is not "not found", throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      // User exists - update last_seen
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          last_seen: new Date().toISOString() 
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (updateError) {
        console.warn("Failed to update last_seen, using existing data:", updateError);
        return {
          userData: existingUser,
          isNewUser: false,
          message: "Welcome back! (Could not update last seen)"
        };
      }

      console.log("Existing user found and updated:", updatedUser);
      return {
        userData: updatedUser,
        isNewUser: false,
        message: "Welcome back!"
      };

    } else {
      // User doesn't exist - create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username: null,
          avatar_url: null,
          total_games_played: 0,
          total_games_won: 0,
          total_earnings: 0,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log("New user created:", newUser);
      return {
        userData: newUser,
        isNewUser: true,
        message: "Welcome to Boardo! Your account has been created."
      };
    }

  } catch (error: any) {
    console.error('Error in checkAndSetupUser:', error);
    return {
      isNewUser: false,
      message: `Failed to setup user: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Legacy function - now uses upsert for simpler logic
 */
export const createOrUpdateUser = async (walletAddress: string, username?: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        wallet_address: walletAddress,
        username: username || null,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export const getUserByWallet = async (walletAddress: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUserProfile = async (
  walletAddress: string, 
  updates: { username?: string; avatar_url?: string }
): Promise<UserData> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserStats = async (
  walletAddress: string, 
  gameWon: boolean, 
  earnings?: number
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_user_game_stats', {
      wallet_addr: walletAddress,
      won: gameWon,
      earnings_delta: earnings || 0
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const getUserStats = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('total_games_played, total_games_won, total_earnings')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, username, total_games_played, total_games_won, total_earnings')
      .order('total_games_won', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};