import { create } from 'zustand'
import { socket } from '@/lib/socket'

interface SocketStore {
  isConnected: boolean
  transport: string
  connect: () => () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  transport: 'N/A',

  connect: () => {
    function onConnect() {
      console.log('Socket connected in store:', socket.id);
      set({ 
        isConnected: true,
        transport: socket.io.engine.transport.name 
      })
      socket.io.engine.on("upgrade", (transport) => {
        set({ transport: transport.name })
      })
    }

    function onDisconnect() {
      console.log('Socket disconnected in store');
      set({ 
        isConnected: false,
        transport: 'N/A' 
      })
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    if (!socket.connected) {
      console.log('Attempting to connect socket...');
      socket.connect()
    } else {
      onConnect()
    }

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  },

  disconnect: () => {
    socket.disconnect()
  }
}))