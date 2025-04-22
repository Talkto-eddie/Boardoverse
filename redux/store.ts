import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./features/wallet/walletSlice"
import gameReducer from "./features/game/gameSlice"
import boardReducer from "./features/board/boardSlice"
import { tabCommunicationMiddleware } from "./middleware/tab-communication-middleware"

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    game: gameReducer,
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(tabCommunicationMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
