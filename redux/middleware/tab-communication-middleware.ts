import type { Middleware } from "redux"
import { tabCommunication } from "@/services/tab-communication"
import {
  updateGameState,
  loadGameFromStorage,
  loadBoardFromStorage,
  joinGameSuccess,
  selectColorPair,
  startGame,
  setDiceValue,
  nextTurn,
  endGame,
} from "@/redux/features/game/gameSlice"
import { moveToken, completeToken } from "@/redux/features/board/boardSlice"
import type { RootState } from "@/redux/store"

export const tabCommunicationMiddleware: Middleware<{}, RootState> = (store) => {
  // Set up listener for messages from other tabs
  tabCommunication.addListener((action) => {
    const state = store.getState()
    const currentGameId = state.game.gameId

    // Only process messages for the current game
    if (currentGameId && action.payload.gameId === currentGameId) {
      switch (action.type) {
        case "GAME_CREATED":
          // Load the game state from localStorage
          const savedState = loadGameFromStorage(action.payload.gameId)
          if (savedState) {
            store.dispatch(updateGameState(savedState))
          }
          break

        case "PLAYER_JOINED":
          // Add the new player to our game
          store.dispatch(
            joinGameSuccess({
              gameId: action.payload.gameId,
              player: action.payload.player,
            }),
          )
          break

        case "COLOR_SELECTED":
          // Update color selection
          store.dispatch(
            selectColorPair({
              playerId: action.payload.playerId,
              colorPair: action.payload.colorPair as any,
            }),
          )
          break

        case "GAME_STARTED":
          // Start the game
          store.dispatch(startGame())
          break

        case "DICE_ROLLED":
          if (action.payload.value !== undefined) {
            // Set the dice value
            store.dispatch(setDiceValue(action.payload.value === 0 ? null : action.payload.value))
          }
          break

        case "TOKEN_MOVED":
          // Handle token movement from other tabs
          store.dispatch(
            moveToken({
              tokenId: action.payload.tokenId,
              position: action.payload.position,
              steps: action.payload.steps,
            }),
          )

          // Check if the token has reached the center
          if (action.payload.position.x === 7 && action.payload.position.y === 7) {
            store.dispatch(completeToken(action.payload.tokenId))
          }

          // Load the latest board state from localStorage
          const boardState = loadBoardFromStorage(action.payload.gameId)
          if (boardState) {
            // Update any other board state if needed
          }
          break

        case "TURN_ENDED":
          // Move to next turn
          store.dispatch(nextTurn())
          break

        case "GAME_ENDED":
          // End the game
          store.dispatch(endGame(action.payload.winner))
          break

        default:
          // For any other action, try to load the latest state from localStorage
          const latestState = loadGameFromStorage(action.payload.gameId)
          if (latestState && latestState.lastUpdated > state.game.lastUpdated) {
            store.dispatch(updateGameState(latestState))
          }
      }
    }
  })

  return (next) => (action) => {
    // Continue the action through the middleware chain
    return next(action)
  }
}
