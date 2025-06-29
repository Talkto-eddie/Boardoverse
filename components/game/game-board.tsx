"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { useBoardStore } from "@/store/boardStore";

const cellColours: Record<string, string> = {
  red: "#ff6666",
  green: "#66cc66",
  yellow: "#ffdd66",
  blue: "#66aaff",
};

export function GameBoard() {
  const { boardPaths, loading, error, fetchBoardPaths } = useBoardStore();
  const { tokens, selectedToken, gameId } = useGameStore();

  const [boardCells, setBoardCells] = useState<JSX.Element[][]>([]);
  const BOARD_SIZE = 15;
  useEffect(() => {
    if (gameId) fetchBoardPaths(gameId);
  }, [gameId, fetchBoardPaths]);

  useEffect(() => {
    if (!boardPaths) return;

    const grid: JSX.Element[][] = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: JSX.Element[] = [];

      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellClass = "ludo-cell";
        const cellStyle: React.CSSProperties = {};

        const coordMatch = ([cx, cy]: [number, number]) => cx === x && cy === y;

        const isCommonPath = boardPaths.commonPath.coords.some(coordMatch);
        if (isCommonPath) cellClass += " common-path";

        /* home paths */
        for (const [color, path] of Object.entries(boardPaths.homePaths)) {
          if (path.coords.some(coordMatch)) {
            cellClass += " home-path";
            cellStyle.backgroundColor = cellColours[color.toLowerCase()] ?? "";
          }
        }

        /* safe zones */
        const safeZone = boardPaths.safeZones.find((z) =>
          z.coords.some(coordMatch)
        );
        if (safeZone) {
          cellClass += " safe-zone";
          cellStyle.backgroundColor =
            cellColours[safeZone.color.toLowerCase()] ?? "";
        }

        /* home bases */
        for (const [color, base] of Object.entries(boardPaths.homeBases)) {
          if (base.coords.some(coordMatch)) {
            cellClass += " home-base";
            cellStyle.backgroundColor = cellColours[color.toLowerCase()] ?? "";
          }
        }

        /* centre star */
        const isCenter = boardPaths.center.coords.some(coordMatch);
        if (isCenter) {
          cellClass += " center";
          cellStyle.backgroundColor = "#ffffff";
        }

        /* tokens sitting in this cell */
        const tokensHere = tokens?.filter((t) => t.x === x && t.y === y) ?? [];

        row.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={cellStyle}
            onClick={() => handleCellClick(x, y)}
          >
            {tokensHere.map((token) => (
              <div
                key={token.id}
                className={`token token-${token.color.toLowerCase()} ${
                  selectedToken?.id === token.id ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTokenClick(token.id);
                }}
              />
            ))}
          </div>
        );
      }
      grid.push(row);
    }

    setBoardCells(grid);
  }, [boardPaths, tokens, selectedToken]);

  const handleCellClick = (x: number, y: number) => {
    // or call socketManager.playRoll(...) when rules permit
  };

  const handleTokenClick = (tokenId: string) => {
    useGameStore.getState().selectToken(tokenId)
  };
  if (loading) return <div>Loading board…</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!boardPaths) return <div>No board data available.</div>;

  return (
    <Card className="ludo-board-container">
      <CardContent>
        <div className="ludo-board">
          {boardCells.map((row, i) => (
            <div key={i} className="ludo-row">
              {row}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
