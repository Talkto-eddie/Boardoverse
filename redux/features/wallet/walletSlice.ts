import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface WalletState {
  connected: boolean
  address: string | null
  balance: number | null
  isConnecting: boolean
  error: string | null
  currentUser: "user1" | "user2" | null
}

const initialState: WalletState = {
  connected: false,
  address: null,
  balance: null,
  isConnecting: false,
  error: null,
  currentUser: null,
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    connectWallet: (state) => {
      state.isConnecting = true
      state.error = null
    },
    connectWalletSuccess: (
      state,
      // action: PayloadAction<{ address: string; balance: number; user: "user1" | "user2" }>,
    ) => {
      state.connected = true
      // state.address = action.payload.address
      // state.balance = action.payload.balance
      state.isConnecting = false
      // state.currentUser = action.payload.user
    },
    setWalletAddressAndBalance: (
      state,
      action: PayloadAction<{
        address: string
        balance: number
    }>)=>{
      state.address = action.payload.address
      state.balance = action.payload.balance
    },
    connectWalletFailure: (state, action: PayloadAction<string>) => {
      state.connected = false
      state.isConnecting = false
      state.error = action.payload
    },
    disconnectWallet: (state) => {
      state.connected = false
      state.address = null
      state.balance = 0
      state.currentUser = null
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload
    },
  },
})

export const { connectWallet, connectWalletSuccess, connectWalletFailure, disconnectWallet, updateBalance, setWalletAddressAndBalance } =
  walletSlice.actions

export default walletSlice.reducer
