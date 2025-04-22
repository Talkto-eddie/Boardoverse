import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { PlayerColor } from "../game/gameSlice"

export interface Position {
  x: number
  y: number
}

export interface Token {
  id: string
  color: PlayerColor
  position: Position
  isHome: boolean
  isCompleted: boolean
  steps: number
  inPlay: boolean
  inHomePath: boolean
}

export interface BoardState {
  tokens: Token[]
  selectedTokenId: string | null
  possibleMoves: Position[]
}

// Define the home areas for each color (where tokens start)
const HOME_AREAS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 11, y: 2 },
    { x: 11, y: 4 },
    { x: 13, y: 2 },
    { x: 13, y: 4 },
  ],
  green: [
    { x: 11, y: 11 },
    { x: 11, y: 13 },
    { x: 13, y: 11 },
    { x: 13, y: 13 },
  ],
  yellow: [
    { x: 2, y: 11 },
    { x: 2, y: 13 },
    { x: 4, y: 11 },
    { x: 4, y: 13 },
  ],
  blue: [
    { x: 2, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 2 },
    { x: 4, y: 4 },
  ],
}

// Helper function to create initial tokens for each player
const createInitialTokens = (): Token[] => {
  const colors: PlayerColor[] = ["red", "green", "yellow", "blue"]
  const tokens: Token[] = []

  colors.forEach((color) => {
    HOME_AREAS[color].forEach((position, index) => {
      tokens.push({
        id: `${color}-${index}`,
        color,
        position,
        isHome: true,
        isCompleted: false,
        steps: 0,
        inPlay: false,
        inHomePath: false,
      })
    })
  })

  return tokens
}

const initialState: BoardState = {
  tokens: createInitialTokens(),
  selectedTokenId: null,
  possibleMoves: [],
}

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    selectToken: (state, action: PayloadAction<string>) => {
      state.selectedTokenId = action.payload
    },
    deselectToken: (state) => {
      state.selectedTokenId = null
      state.possibleMoves = []
    },
    setPossibleMoves: (state, action: PayloadAction<Position[]>) => {
      state.possibleMoves = action.payload
    },
    moveToken: (
      state,
      action: PayloadAction<{ tokenId: string; position: Position; steps: number; inHomePath?: boolean }>,
    ) => {
      const token = state.tokens.find((t) => t.id === action.payload.tokenId)
      if (token) {
        token.position = action.payload.position
        token.isHome = false
        token.inPlay = true
        token.steps += action.payload.steps
        // Update inHomePath if provided
        if (action.payload.inHomePath !== undefined) {
          token.inHomePath = action.payload.inHomePath
        }
      }
      state.selectedTokenId = null
      state.possibleMoves = []
    },
    completeToken: (state, action: PayloadAction<string>) => {
      const token = state.tokens.find((t) => t.id === action.payload)
      if (token) {
        token.isCompleted = true
      }
    },
    returnTokenHome: (state, action: PayloadAction<string>) => {
      const token = state.tokens.find((t) => t.id === action.payload)
      if (token) {
        const homeIndex = Number.parseInt(token.id.split("-")[1])
        token.position = HOME_AREAS[token.color][homeIndex]
        token.isHome = true
        token.inPlay = false
        token.steps = 0
        token.inHomePath = false
      }
    },
    resetBoard: () => initialState,
    // Add a new action to update the entire board state
    updateBoardState: (state, action: PayloadAction<BoardState>) => {
      return action.payload
    },
  },
})

export const {
  selectToken,
  deselectToken,
  setPossibleMoves,
  moveToken,
  completeToken,
  returnTokenHome,
  resetBoard,
  updateBoardState,
} = boardSlice.actions

export default boardSlice.reducer
