import { create } from 'zustand'
import { BoardPaths, socketManager } from '@/lib/socket-manager'

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
      const paths = await socketManager.getBoardPaths(gameId)
      set({ boardPaths: paths, loading: false })
    } catch (error) {
      set({ error: String(error), loading: false })
    }
  }
}))