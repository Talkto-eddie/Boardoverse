"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { useBoardStore } from "@/store/boardStore";

// Ludo board configuration
const BOARD_SIZE = 15;
const HOME_SIZE = 6;
const PATH_WIDTH = 3;

// Color definitions
const COLORS = {
  RED: '#dc2626',
  GREEN: '#16a34a', 
  YELLOW: '#ca8a04',
  BLUE: '#2563eb',
  WHITE: '#ffffff',
  GRAY: '#6b7280',
  LIGHT_GRAY: '#f3f4f6'
};

// Board position mappings for a standard Ludo board
const LUDO_PATHS = {
  // Main circular path (52 positions total)
  MAIN_PATH: [
    // Red starting position and path (positions 0-12)
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
    // Up the left side (positions 6-11)
    [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
    // Across the top (positions 12-17)
    [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0],
    // Green corner and down (positions 18-23)
    [13, 0], [14, 0], [14, 1], [14, 2], [14, 3], [14, 4],
    // Yellow starting position (positions 24-29)
    [14, 5], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6],
    // Down right side (positions 30-35)
    [9, 6], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10],
    // Across bottom (positions 36-41)
    [8, 11], [8, 12], [8, 13], [8, 14], [7, 14], [6, 14],
    // Blue corner and up (positions 42-47)
    [5, 14], [4, 14], [3, 14], [2, 14], [1, 14], [0, 14],
    // Back to red (positions 48-51)
    [0, 13], [0, 12], [0, 11], [0, 10], [0, 9], [0, 8], [0, 7], [0, 6]
  ],
  
  // Home areas (where tokens start)
  HOME_AREAS: {
    RED: [[1, 1], [3, 1], [1, 3], [3, 3]],
    GREEN: [[11, 1], [13, 1], [11, 3], [13, 3]], 
    YELLOW: [[11, 11], [13, 11], [11, 13], [13, 13]],
    BLUE: [[1, 11], [3, 11], [1, 13], [3, 13]]
  },
  
  // Final home stretch paths (colored paths to center)
  HOME_STRETCH: {
    RED: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    GREEN: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    YELLOW: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], 
    BLUE: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]
  },
  
  // Center winning area
  CENTER: [[7, 7]],
  
  // Safe spots (marked with stars)
  SAFE_SPOTS: [
    [1, 6], [6, 1], [8, 6], [13, 6], [6, 13], [8, 8], [6, 8], [8, 1], [14, 6], [8, 14], [0, 8], [6, 0]
  ],

  // Starting positions for each color
  START_POSITIONS: {
    RED: [1, 6],
    GREEN: [6, 1], 
    YELLOW: [13, 8],
    BLUE: [8, 13]
  }
};

export function GameBoard() {
  const { boardPaths, loading, error, fetchBoardPaths } = useBoardStore();
  const { tokens, selectedToken, gameId, players, currentPlayerIndex, dice, myTurn } = useGameStore();
  const { walletAddress } = useUserStore();

  const [highlightedCells, setHighlightedCells] = useState<{x: number, y: number}[]>([]);
  const [animatingToken, setAnimatingToken] = useState<string | null>(null);
  const [pathHighlight, setPathHighlight] = useState<{x: number, y: number}[]>([]);
  
  // Get current player info
  const currentPlayer = players[currentPlayerIndex] || null;
  const isCurrentPlayerTurn = myTurn && currentPlayer?.address === walletAddress;
  const currentPlayerColors = currentPlayer?.colors || [];
  const diceValue = dice && dice.length > 0 ? dice[0] : null;

  useEffect(() => {
    if (gameId) fetchBoardPaths(gameId);
  }, [gameId, fetchBoardPaths]);

  // Calculate possible moves for selected token
  useEffect(() => {
    if (selectedToken && diceValue && isCurrentPlayerTurn) {
      const possibleMoves = calculatePossibleMoves(selectedToken, diceValue);
      const pathCells = calculatePath(selectedToken, diceValue);
      setHighlightedCells(possibleMoves);
      setPathHighlight(pathCells);
    } else {
      setHighlightedCells([]);
      setPathHighlight([]);
    }
  }, [selectedToken, diceValue, isCurrentPlayerTurn]);

  // Calculate where a token can move
  const calculatePossibleMoves = (token: any, moves: number): {x: number, y: number}[] => {
    if (!token) return [];
    
    // If token is in home area and rolled 6, can move to start
    if (token.position === -1 && moves === 6) {
      const startPos = getStartingPosition(token.color);
      return startPos ? [startPos] : [];
    }
    
    // If token is on board, calculate new position
    if (token.position >= 0) {
      const newPos = token.position + moves;
      const coords = getCoordinatesFromPosition(newPos, token.color);
      return coords ? [coords] : [];
    }
    
    return [];
  };

  // Calculate the path a token would take
  const calculatePath = (token: any, moves: number): {x: number, y: number}[] => {
    if (!token || token.position === -1) return [];
    
    const path: {x: number, y: number}[] = [];
    const startPos = token.position;
    
    for (let i = 1; i <= moves; i++) {
      const coords = getCoordinatesFromPosition(startPos + i, token.color);
      if (coords) path.push(coords);
    }
    
    return path;
  };

  // Get starting position for a color
  const getStartingPosition = (color: string): {x: number, y: number} | null => {
    const startPos = LUDO_PATHS.START_POSITIONS[color.toUpperCase() as keyof typeof LUDO_PATHS.START_POSITIONS];
    return startPos ? {x: startPos[0], y: startPos[1]} : null;
  };

  // Convert position number to board coordinates
  const getCoordinatesFromPosition = (position: number, color: string): {x: number, y: number} | null => {
    if (position < 0) return null;
    
    // Handle home stretch
    if (position >= 50) {
      const homeStretch = LUDO_PATHS.HOME_STRETCH[color.toUpperCase() as keyof typeof LUDO_PATHS.HOME_STRETCH];
      const homeIndex = position - 50;
      if (homeIndex < homeStretch.length) {
        return {x: homeStretch[homeIndex][0], y: homeStretch[homeIndex][1]};
      }
      // Center
      if (homeIndex === homeStretch.length) {
        return {x: 7, y: 7};
      }
      return null;
    }
    
    // Main path
    if (position < LUDO_PATHS.MAIN_PATH.length) {
      return {x: LUDO_PATHS.MAIN_PATH[position][0], y: LUDO_PATHS.MAIN_PATH[position][1]};
    }
    
    return null;
  };
  useEffect(() => {
    if (gameId) fetchBoardPaths(gameId);
  }, [gameId, fetchBoardPaths]);

  // Generate the board cells with proper Ludo layout
  const generateBoard = () => {
    const board: JSX.Element[][] = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: JSX.Element[] = [];
      
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellClass = "ludo-cell";
        let cellStyle: React.CSSProperties = {
          backgroundColor: COLORS.LIGHT_GRAY,
          border: '1px solid #d1d5db'
        };
        
        // Determine cell type and styling
        const cellType = getCellType(x, y);
        
        switch (cellType.type) {
          case 'home':
            cellClass += " ludo-home-area";
            cellStyle.backgroundColor = cellType.color;
            cellStyle.border = '2px solid #374151';
            break;
            
          case 'path':
            cellClass += " ludo-path";
            cellStyle.backgroundColor = COLORS.WHITE;
            cellStyle.border = '1px solid #9ca3af';
            break;
            
          case 'home-stretch':
            cellClass += " ludo-home-stretch";
            cellStyle.backgroundColor = cellType.color;
            cellStyle.border = '1px solid #374151';
            break;
            
          case 'center':
            cellClass += " ludo-center";
            cellStyle.backgroundColor = '#fbbf24';
            cellStyle.border = '3px solid #d97706';
            break;
            
          case 'safe':
            cellClass += " ludo-safe ludo-path";
            cellStyle.backgroundColor = COLORS.WHITE;
            cellStyle.border = '2px solid #059669';
            break;
            
          case 'start':
            cellClass += " ludo-start ludo-path";
            cellStyle.backgroundColor = COLORS.WHITE;
            cellStyle.border = '3px solid #dc2626';
            break;
            
          default:
            cellClass += " ludo-empty";
            break;
        }
        
        // Check if cell should be highlighted
        const isHighlighted = highlightedCells.some(cell => cell.x === x && cell.y === y);
        const isOnPath = pathHighlight.some(cell => cell.x === x && cell.y === y);
        
        if (isHighlighted) {
          cellClass += " ludo-highlighted";
          cellStyle.boxShadow = '0 0 15px rgba(59, 130, 246, 0.8)';
          cellStyle.border = '3px solid #3b82f6';
        } else if (isOnPath) {
          cellClass += " ludo-path-highlight";
          cellStyle.boxShadow = '0 0 8px rgba(34, 197, 94, 0.5)';
          cellStyle.border = '2px solid #22c55e';
        }
        
        // Get tokens at this position
        const tokensHere = tokens?.filter((t) => t.x === x && t.y === y) ?? [];
        
        row.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={cellStyle}
            onClick={() => handleCellClick(x, y)}
          >
            {/* Cell content */}
            {cellType.type === 'safe' && (
              <div className="text-green-600 text-lg font-bold">★</div>
            )}
            {cellType.type === 'center' && (
              <div className="text-yellow-800 text-2xl font-bold">🏆</div>
            )}
            
            {/* Tokens */}
            <div className="ludo-tokens-container">
              {tokensHere.map((token, index) => {
                const isMyToken = currentPlayerColors.some(color => 
                  color.toLowerCase() === token.color.toLowerCase()
                );
                const canClick = isMyToken && isCurrentPlayerTurn && diceValue && !animatingToken;
                const isAnimating = animatingToken === token.id;
                const isSelected = selectedToken?.id === token.id;
                
                return (
                  <div
                    key={token.id}
                    className={`ludo-token ${token.color.toLowerCase()} ${
                      isSelected ? 'selected' : ''
                    } ${canClick ? 'clickable' : ''} ${isAnimating ? 'animating' : ''}`}
                    style={{
                      backgroundColor: COLORS[token.color.toUpperCase() as keyof typeof COLORS] || COLORS.GRAY,
                      zIndex: isSelected ? 30 : (isAnimating ? 25 : 10 + index),
                      transform: `scale(${isSelected ? 1.3 : (isAnimating ? 1.1 : 1)}) ${
                        tokensHere.length > 1 ? `translate(${(index % 2) * 6 - 3}px, ${Math.floor(index / 2) * 6 - 3}px)` : ''
                      }`,
                      cursor: canClick ? 'pointer' : 'default',
                      transition: isAnimating ? 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canClick) {
                        handleTokenClick(token.id);
                      }
                    }}
                  >
                    <div className="token-inner">
                      {token.index + 1}
                      {isMyToken && canClick && (
                        <div className="token-glow"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      board.push(row);
    }
    
    return board;
  };

  // Determine what type of cell this is
  const getCellType = (x: number, y: number) => {
    // Check center
    if (LUDO_PATHS.CENTER.some(([cx, cy]) => cx === x && cy === y)) {
      return { type: 'center' };
    }
    
    // Check home areas
    for (const [color, positions] of Object.entries(LUDO_PATHS.HOME_AREAS)) {
      if (positions.some(([hx, hy]) => hx === x && hy === y)) {
        return { 
          type: 'home', 
          color: COLORS[color as keyof typeof COLORS]
        };
      }
    }
    
    // Check home stretches
    for (const [color, positions] of Object.entries(LUDO_PATHS.HOME_STRETCH)) {
      if (positions.some(([hx, hy]) => hx === x && hy === y)) {
        return { 
          type: 'home-stretch', 
          color: COLORS[color as keyof typeof COLORS]
        };
      }
    }
    
    // Check safe spots
    if (LUDO_PATHS.SAFE_SPOTS.some(([sx, sy]) => sx === x && sy === y)) {
      return { type: 'safe' };
    }
    
    // Check main path
    if (LUDO_PATHS.MAIN_PATH.some(([px, py]) => px === x && py === y)) {
      // Check if it's a starting position
      const startPositions = [
        {x: 1, y: 6}, {x: 6, y: 1}, {x: 13, y: 8}, {x: 8, y: 13}
      ];
      if (startPositions.some(pos => pos.x === x && pos.y === y)) {
        return { type: 'start' };
      }
      return { type: 'path' };
    }
    
    return { type: 'empty' };
  };  const handleCellClick = (x: number, y: number) => {
    // Handle clicking on highlighted cells for moves
    const isHighlighted = highlightedCells.some(cell => cell.x === x && cell.y === y);
    if (isHighlighted && selectedToken && diceValue && isCurrentPlayerTurn && !animatingToken) {
      console.log(`Moving ${selectedToken.color} token to (${x}, ${y})`);
      setAnimatingToken(selectedToken.id);
      
      // Clear selection and highlights after a delay
      setTimeout(() => {
        setAnimatingToken(null);
        useGameStore.getState().selectToken('');
      }, 500);
    }
  };

  const handleTokenClick = (tokenId: string) => {
    const token = tokens?.find(t => t.id === tokenId);
    if (!token || animatingToken) return;
    
    const isMyToken = currentPlayerColors.some(color => 
      color.toLowerCase() === token.color.toLowerCase()
    );
    
    if (isMyToken && isCurrentPlayerTurn && diceValue) {
      // If clicking on the same token, deselect it
      if (selectedToken?.id === tokenId) {
        useGameStore.getState().selectToken('');
      } else {
        useGameStore.getState().selectToken(tokenId);
      }
    }
  };

  if (loading) return (
    <Card className="ludo-board-container">
      <CardContent className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading board...</p>
        </div>
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card className="ludo-board-container">
      <CardContent className="flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <p>Error loading board: {error}</p>
        </div>
      </CardContent>
    </Card>
  );

  const boardCells = generateBoard();

  return (
    <Card className="ludo-board-container">
      <CardContent className="p-6">
        {/* Board Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">🎲 Ludo Board</h3>
            {gameId && (
              <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                Game: {gameId.slice(0, 8)}...
              </div>
            )}
          </div>
          
          {isCurrentPlayerTurn && diceValue && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-2 shadow-sm">
              {selectedToken ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">
                    🎯 Selected: <span className="capitalize font-bold" style={{color: COLORS[selectedToken.color.toUpperCase() as keyof typeof COLORS]}}>{selectedToken.color}</span> Token #{selectedToken.index + 1}
                  </p>
                  <p className="text-xs text-blue-600">
                    🎲 Move {diceValue} spaces • Click destination or select another token
                  </p>
                  {pathHighlight.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <span>🛤️ Path: {pathHighlight.length} steps</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">
                    🎲 Rolled: <span className="font-bold text-lg">{diceValue}</span> • Your Turn!
                  </p>
                  <p className="text-xs text-blue-600">
                    Click one of your <span className="font-medium">{currentPlayerColors.join(' or ')}</span> tokens to move
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!isCurrentPlayerTurn && currentPlayer && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p className="text-sm text-gray-600">
                ⏳ Waiting for <span className="font-medium">{currentPlayer.address.slice(0, 8)}...</span>
              </p>
            </div>
          )}
          
          {animatingToken && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
              <p className="text-sm text-yellow-800">
                🚀 Moving token...
              </p>
            </div>
          )}
        </div>

        {/* The Ludo Board */}
        <div className="relative">
          {/* Board Compass */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 z-10 board-compass">
            <div className="text-center">
              <div className="text-red-500">R</div>
              <div className="text-[8px] text-gray-400">Start</div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 z-10 board-compass">
            <div className="text-center">
              <div className="text-green-500">G</div>
              <div className="text-[8px] text-gray-400">Start</div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 z-10 board-compass">
            <div className="text-center">
              <div className="text-yellow-500">Y</div>
              <div className="text-[8px] text-gray-400">Start</div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 z-10 board-compass">
            <div className="text-center">
              <div className="text-blue-500">B</div>
              <div className="text-[8px] text-gray-400">Start</div>
            </div>
          </div>
          
          <div className="ludo-board-modern">
            {boardCells.map((row, y) => (
              <div key={y} className="ludo-row-modern">
                {row}
              </div>
            ))}
          </div>
        </div>
        
        {/* Board Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700">🎨 Player Colors:</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLORS).slice(0, 4).map(([name, color]) => (
                <div key={name} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" 
                    style={{backgroundColor: color}}
                  ></div>
                  <span className="capitalize text-gray-600">{name.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700">🎯 Board Guide:</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="text-green-600 font-bold text-sm">★</div>
                <span className="text-gray-600">Safe spots (protected)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-yellow-600 font-bold text-lg">🏆</div>
                <span className="text-gray-600">Home (finish line)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded border border-blue-600 shadow-sm"></div>
                <span className="text-gray-600">Possible moves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded border border-green-600 shadow-sm"></div>
                <span className="text-gray-600">Movement path</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <div>• <strong>Roll 6</strong> to exit home area</div>
              <div>• <strong>Land on opponents</strong> to send them back</div>
              <div>• <strong>Safe spots</strong> protect from capture</div>
              <div>• <strong>First to get all tokens home</strong> wins!</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
