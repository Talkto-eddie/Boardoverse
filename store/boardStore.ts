import { create } from 'zustand'
import { supabaseGameManager } from '@/lib/supabase-game-manager'

interface BoardPaths {
  [key: string]: any // Define proper interface based on your board paths structure
}

interface BoardState {
  boardPaths: BoardPaths | null
  loading: boolean
  error: string | null
  fetchBoardPaths: (gameId: string) => Promise<void>
}

export const useBoardStore = create<BoardState>((set) => ({
  boardPaths: null,
  loading: false,
  error: null,

  fetchBoardPaths: async (gameId: string) => {
    try {
      set({ loading: true, error: null })
      const paths = await supabaseGameManager.getBoardPaths(gameId)
      set({ boardPaths: paths, loading: false })
    } catch (error) {
      set({ error: String(error), loading: false })
    }
  }
}))