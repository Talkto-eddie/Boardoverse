import { socket } from "./socket";

export interface BoardPaths {
  commonPath: {
    type: "path";
    coords: [number, number][];
    length: number;
    next: number[];
    prev: number[];
  };
  homePaths: {
    [color: string]: {
      type: "homepath";
      coords: [number, number][];
      length: number;
      entryPoint: number;
    };
  };
  safeZones: {
    type: "safezone";
    coords: [number, number][];
    color: string;
  }[];
  homeBases: {
    [color: string]: {
      type: "homebase";
      coords: [number, number][];
    };
  };
  startAreas: {
    [color: string]: {
      type: "startarea";
      coords: [number, number][];
    };
  };
  center: { type: "center"; coords: [number, number][] };
}

export interface TokenState {
  id: string;           // "RED-0"
  color: string;        // "RED" | "GREEN" | "YELLOW" | "BLUE"
  x: number;
  y: number;
  position: number;
  index: number;        // 0-3
  isClickable: boolean;
}

export interface GameState {
  tokens: TokenState[];
  dice: number[];
  myTurn: boolean;
  gameOver: boolean;
  winner: number | null;
}

interface CreateOrJoinResponse {
  gameId: string;
  playerId: string;
  colors: string[];
  error?: string;
}

interface DiceRollData {
  playerId: number;
  dice: number[];
  gameId: string;
}


export const socketManager = {
  createGame: (vsComputer = false): Promise<CreateOrJoinResponse> =>
    new Promise((resolve, reject) => {
      socket.emit("createGame", { vsComputer }, (res: CreateOrJoinResponse) =>
        res.error ? reject(new Error(res.error)) : resolve(res)
      );
    }),

  joinGame: (gameId: string): Promise<CreateOrJoinResponse> =>
    new Promise((resolve, reject) => {
      socket.emit("joinGame", gameId, (res: CreateOrJoinResponse) =>
        res.error ? reject(new Error(res.error)) : resolve(res)
      );
    }),
  getBoardPaths: (gameId: string): Promise<BoardPaths> =>
    new Promise((resolve) => {
      socket.emit("getBoardPaths", gameId, (paths: BoardPaths) => resolve(paths));
    }),
    
  rollDice: (gameId: string) => {
    socket.emit("rollDice", { gameId });
  },

  playRoll: (tokenId: string, rolledValue: number, gameId: string) => {
    socket.emit("playRoll", { tokenId, rolledValue, gameId });
  },

  skipTurn: (gameId: string) => {
    socket.emit("skipTurn", { gameId });
  },

  onGameStateUpdated: (cb: (state: GameState) => void) => {
    socket.on("gameStateUpdated", cb);
    return () => socket.off("gameStateUpdated", cb);
  },

  onDiceRolled: (cb: (data: DiceRollData) => void) => {
    socket.on("diceRolled", cb);
    return () => socket.off("diceRolled", cb);
  },

  onPlayerDisconnected: (cb: () => void) => {
    socket.on("playerDisconnected", cb);
    return () => socket.off("playerDisconnected", cb);
  },

  onError: (cb: (err: { message: string }) => void) => {
    socket.on("error", cb);
    return () => socket.off("error", cb);
  },
  connect: () => socket.connect(),
  disconnect: () => socket.disconnect(),
};
