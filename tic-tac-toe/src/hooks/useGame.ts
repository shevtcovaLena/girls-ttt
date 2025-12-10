import { useState } from 'react';
import {
  initializeBoard,
  calculateWinner,
  isBoardFull,
  isValidMove,
  getComputerMove,
  type Board,
} from '@/lib/gameLogic';

type GameStatus = 'active' | 'won' | 'lost' | 'draw';

interface UseGameReturn {
  board: Board;
  gameStatus: GameStatus;
  lastPromoCode: string | null;
  isComputerThinking: boolean;
  lastMoveIndex: number | null;
  handleCellClick: (index: number) => Promise<void>;
  resetGame: () => void;
}

/**
 * Custom hook for managing game state and logic
 */
export function useGame(onGameEnd?: (promoCode: string) => void): UseGameReturn {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>('active');
  const [lastPromoCode, setLastPromoCode] = useState<string | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);

  /**
   * Handles player's cell click
   */
  const handleCellClick = async (index: number) => {
    if (gameStatus !== 'active' || isComputerThinking) {
      return;
    }

    if (!isValidMove(board, index)) {
      return;
    }

    const newBoard: Board = [...board] as Board;
    newBoard[index] = 'X';
    setBoard(newBoard);
    setLastMoveIndex(index);

    const winner = calculateWinner(newBoard);
    if (winner === 'X') {
      try {
        const response = await fetch('/api/promo-code');
        const data = await response.json();
        const promoCode = data.promoCode;
        setLastPromoCode(promoCode);
        setGameStatus('won');
        if (onGameEnd) {
          onGameEnd(promoCode);
        }
      } catch (error) {
        console.error('Failed to generate promo code:', error);
        setGameStatus('won');
        if (onGameEnd) {
          onGameEnd('');
        }
      }
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      return;
    }

    setIsComputerThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const computerMove = getComputerMove(newBoard);
    if (computerMove !== -1) {
      const boardAfterComputer: Board = [...newBoard] as Board;
      boardAfterComputer[computerMove] = 'O';
      setBoard(boardAfterComputer);
      setLastMoveIndex(computerMove);

      const winnerAfterComputer = calculateWinner(boardAfterComputer);
      if (winnerAfterComputer === 'O') {
        setGameStatus('lost');
        setIsComputerThinking(false);
        return;
      }

      if (isBoardFull(boardAfterComputer)) {
        setGameStatus('draw');
        setIsComputerThinking(false);
        return;
      }
    }

    setIsComputerThinking(false);
  };

  /**
   * Resets the game to initial state
   */
  const resetGame = () => {
    setBoard(initializeBoard());
    setGameStatus('active');
    setLastPromoCode(null);
    setIsComputerThinking(false);
    setLastMoveIndex(null);
  };

  return {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    lastMoveIndex,
    handleCellClick,
    resetGame,
  };
}
