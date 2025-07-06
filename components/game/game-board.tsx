"use client";

import { JSX, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { useBoardStore } from "@/store/boardStore";

const BOARD_SIZE = 15;

// Simple color mapping
const COLORS = {
  RED: '#ef4444',
  GREEN: '#22c55e', 
  YELLOW: '#eab308',
  BLUE: '#3b82f6',
};

export function GameBoard() {
  const { tokens, selectedToken, gameId, players, currentPlayerIndex, dice, myTurn } = useGameStore();
  const { walletAddress } = useUserStore();
  const { fetchBoardPaths } = useBoardStore();

  const [highlightedCells, setHighlightedCells] = useState<{x: number, y: number}[]>([]);
  
  const currentPlayer = players[currentPlayerIndex] || null;
  const isCurrentPlayerTurn = myTurn && currentPlayer?.address === walletAddress;
  const currentPlayerColors = currentPlayer?.colors || [];
  const diceValue = dice && dice.length > 0 ? dice[0] : null;

  useEffect(() => {
    if (gameId) fetchBoardPaths(gameId);
  }, [gameId, fetchBoardPaths]);

  // Simple cell type determination based on the image
  const getCellType = (x: number, y: number) => {
    // Center cell (7,7)
    if (x === 7 && y === 7) {
      return 'center';
    }

    // Red home area (top-left 6x6)
    if (x >= 0 && x <= 5 && y >= 0 && y <= 5) {
      // Token home positions (2x2 in center)
      if ((x === 2 || x === 3) && (y === 2 || y === 3)) {
        return 'red-token-home';
      }
      return 'red-home';
    }

    // Blue home area (top-right 6x6) 
    if (x >= 9 && x <= 14 && y >= 0 && y <= 5) {
      // Token home positions (2x2 in center)
      if ((x === 11 || x === 12) && (y === 2 || y === 3)) {
        return 'blue-token-home';
      }
      return 'blue-home';
    }

    // Green home area (bottom-left 6x6)
    if (x >= 0 && x <= 5 && y >= 9 && y <= 14) {
      // Token home positions (2x2 in center)
      if ((x === 2 || x === 3) && (y === 11 || y === 12)) {
        return 'green-token-home';
      }
      return 'green-home';
    }

    // Yellow home area (bottom-right 6x6)
    if (x >= 9 && x <= 14 && y >= 9 && y <= 14) {
      // Token home positions (2x2 in center)
      if ((x === 11 || x === 12) && (y === 11 || y === 12)) {
        return 'yellow-token-home';
      }
      return 'yellow-home';
    }

    // Main path (3-wide cross pattern)
    // Vertical path (columns 6, 7, 8)
    if ((x >= 6 && x <= 8) && (y >= 0 && y <= 14)) {
      // Red home stretch (column 7, rows 1-6)
      if (x === 7 && y >= 1 && y <= 6) return 'red-stretch';
      // Yellow home stretch (column 7, rows 8-13)
      if (x === 7 && y >= 8 && y <= 13) return 'yellow-stretch';
      return 'path';
    }

    // Horizontal path (rows 6, 7, 8)
    if ((y >= 6 && y <= 8) && (x >= 0 && x <= 14)) {
      // Green home stretch (row 7, columns 1-6)
      if (y === 7 && x >= 1 && x <= 6) return 'green-stretch';
      // Blue home stretch (row 7, columns 8-13)
      if (y === 7 && x >= 8 && x <= 13) return 'blue-stretch';
      return 'path';
    }

    return 'empty';
  };

  const generateBoard = () => {
    const board: JSX.Element[][] = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: JSX.Element[] = [];
      
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cellType = getCellType(x, y);
        let cellStyle: React.CSSProperties = {};
        let cellClass = "aspect-square border border-gray-300 flex items-center justify-center text-xs font-bold relative min-w-6 min-h-6";
        
        // Make cells responsive - smaller on mobile, larger on desktop
        cellClass += " w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10";

        // Style based on cell type
        switch (cellType) {
          case 'red-home':
            cellStyle.backgroundColor = '#fecaca'; // Light red
            break;
          case 'red-token-home':
            cellStyle.backgroundColor = COLORS.RED;
            cellStyle.color = 'white';
            break;
          case 'red-stretch':
            cellStyle.backgroundColor = '#fca5a5'; // Medium red
            break;
          case 'blue-home':
            cellStyle.backgroundColor = '#bfdbfe'; // Light blue
            break;
          case 'blue-token-home':
            cellStyle.backgroundColor = COLORS.BLUE;
            cellStyle.color = 'white';
            break;
          case 'blue-stretch':
            cellStyle.backgroundColor = '#93c5fd'; // Medium blue
            break;
          case 'green-home':
            cellStyle.backgroundColor = '#bbf7d0'; // Light green
            break;
          case 'green-token-home':
            cellStyle.backgroundColor = COLORS.GREEN;
            cellStyle.color = 'white';
            break;
          case 'green-stretch':
            cellStyle.backgroundColor = '#86efac'; // Medium green
            break;
          case 'yellow-home':
            cellStyle.backgroundColor = '#fef3c7'; // Light yellow
            break;
          case 'yellow-token-home':
            cellStyle.backgroundColor = COLORS.YELLOW;
            cellStyle.color = 'white';
            break;
          case 'yellow-stretch':
            cellStyle.backgroundColor = '#fde047'; // Medium yellow
            break;
          case 'center':
            cellStyle.backgroundColor = 'white';
            cellStyle.border = '2px solid #374151';
            break;
          case 'path':
            cellStyle.backgroundColor = 'white';
            break;
          default:
            cellStyle.backgroundColor = '#f3f4f6';
            break;
        }

        // Get tokens at this position
        const tokensHere = tokens?.filter((t) => t.x === x && t.y === y) ?? [];

        row.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={cellStyle}
            onClick={() => console.log(`Clicked cell (${x}, ${y})`)}
          >
            {/* Center gets the 4-color diamond */}
            {cellType === 'center' && (
              <div className="w-full h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/2 h-1/2" style={{backgroundColor: COLORS.RED}}></div>
                <div className="absolute top-0 right-0 w-1/2 h-1/2" style={{backgroundColor: COLORS.BLUE}}></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2" style={{backgroundColor: COLORS.GREEN}}></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2" style={{backgroundColor: COLORS.YELLOW}}></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-lg">🏆</div>
              </div>
            )}

            {/* Show tokens if any */}
            {tokensHere.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {tokensHere.map((token, index) => (
                  <div
                    key={token.id}
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor: COLORS[token.color.toUpperCase() as keyof typeof COLORS],
                      transform: tokensHere.length > 1 ? `translate(${(index % 2) * 4 - 2}px, ${Math.floor(index / 2) * 4 - 2}px)` : ''
                    }}
                  >
                    {token.index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      board.push(row);
    }
    
    return board;
  };

  const boardCells = generateBoard();

  return (
    <Card className="w-full h-full">
      <CardContent className="p-2 h-full flex flex-col justify-start">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-1">🎲 Ludo Board</h3>
          {isCurrentPlayerTurn && diceValue && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-sm text-blue-800">
                🎲 You rolled: <span className="font-bold">{diceValue}</span> • Your turn!
              </p>
            </div>
          )}
        </div>

        {/* Simple 15x15 grid board */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="inline-block border-2 border-gray-800 bg-white">
            {boardCells.map((row, y) => (
              <div key={y} className="flex">
                {row}
              </div>
            ))}
          </div>
        </div>

        {/* Simple legend */}
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: COLORS.RED}}></div>
            <span>Red</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: COLORS.BLUE}}></div>
            <span>Blue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: COLORS.GREEN}}></div>
            <span>Green</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: COLORS.YELLOW}}></div>
            <span>Yellow</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
