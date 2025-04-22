// Type definitions for messages
export type GameAction =
  | { type: "GAME_CREATED"; payload: { gameId: string; creator: string } }
  | { type: "PLAYER_JOINED"; payload: { gameId: string; player: any } }
  | { type: "COLOR_SELECTED"; payload: { gameId: string; playerId: string; colorPair: string } }
  | { type: "GAME_STARTED"; payload: { gameId: string } }
  | { type: "DICE_ROLLED"; payload: { gameId: string; value: number } }
  | { type: "TOKEN_MOVED"; payload: { gameId: string; tokenId: string; position: any; steps: number } }
  | { type: "TURN_ENDED"; payload: { gameId: string } }
  | { type: "GAME_ENDED"; payload: { gameId: string; winner: string } }

class TabCommunicationService {
  private channel: BroadcastChannel | null = null
  private listeners: ((action: GameAction) => void)[] = []
  private gameId: string | null = null
  private lastMessageTimestamp = 0
  private messageQueue: GameAction[] = []
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    // Try to use BroadcastChannel API, fall back to localStorage if not available
    try {
      this.channel = new BroadcastChannel("ludo_game_channel")
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data)
      }
    } catch (e) {
      console.log("BroadcastChannel not supported, falling back to localStorage")
      // Set up localStorage event listener
      window.addEventListener("storage", (event) => {
        if (event.key === "ludo_game_message") {
          try {
            const data = JSON.parse(event.newValue || "{}")
            this.notifyListeners(data)
          } catch (e) {
            console.error("Failed to parse message", e)
          }
        }
      })
    }

    // Start processing queued messages
    this.processingInterval = setInterval(() => this.processMessageQueue(), 100)
  }

  // Set the current game ID
  setGameId(gameId: string) {
    this.gameId = gameId
  }

  // Send a message to other tabs
  sendMessage(action: GameAction) {
    // Only send messages for the current game
    if (this.gameId && action.payload.gameId !== this.gameId) {
      return
    }

    // Add timestamp to track message order
    const messageWithTimestamp = {
      ...action,
      timestamp: Date.now(),
    }

    if (this.channel) {
      this.channel.postMessage(messageWithTimestamp)
    } else {
      // Use localStorage as fallback
      localStorage.setItem("ludo_game_message", JSON.stringify(messageWithTimestamp))
      // We need to remove it and set it again to trigger storage event in other tabs
      setTimeout(() => {
        localStorage.removeItem("ludo_game_message")
      }, 100)
    }

    // Also process the message locally to ensure consistent state
    this.queueMessage(action)
  }

  // Queue a message for processing
  private queueMessage(action: GameAction) {
    this.messageQueue.push(action)
  }

  // Process queued messages in order
  private processMessageQueue() {
    if (this.messageQueue.length > 0) {
      const action = this.messageQueue.shift()
      if (action) {
        this.notifyListeners(action)
      }
    }
  }

  // Add a listener for incoming messages
  addListener(callback: (action: GameAction) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  // Notify all listeners of a new message
  private notifyListeners(action: GameAction) {
    // Only process messages for the current game
    if (this.gameId && action.payload.gameId !== this.gameId) {
      return
    }

    // Ensure messages are processed in order
    const timestamp = (action as any).timestamp || Date.now()
    if (timestamp < this.lastMessageTimestamp) {
      console.log("Received out-of-order message, queueing for later processing")
      this.queueMessage(action)
      return
    }

    this.lastMessageTimestamp = timestamp

    this.listeners.forEach((listener) => listener(action))
  }

  // Clean up when done
  cleanup() {
    if (this.channel) {
      this.channel.close()
    }
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }
    this.listeners = []
    this.messageQueue = []
  }
}

// Create a singleton instance
export const tabCommunication = new TabCommunicationService()

// Export a hook for components to use
export function useTabCommunication() {
  return tabCommunication
}
