'use client';

import { useState, useCallback } from 'react';
import {
  initializeBoard,
  calculateWinner,
  isBoardFull,
  isValidMove,
  getComputerMove,
  type Board,
} from '@/lib/gameLogic';
import { generatePromoCode } from '@/lib/generatePromoCode';
import { sendTelegramNotification } from '@/lib/telegram';

type GameStatus = 'active' | 'won' | 'lost' | 'draw';

/**
 * Custom hook for managing game state and logic
 */
function useGame() {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>('active');
  const [lastPromoCode, setLastPromoCode] = useState<string | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  /**
   * Handles player's cell click
   */
  const handleCellClick = useCallback(
    async (index: number) => {
      // Block clicks if game is over or computer is thinking
      if (gameStatus !== 'active' || isComputerThinking) {
        return;
      }

      // Validate move
      if (!isValidMove(board, index)) {
        return;
      }

      // Player makes move (X)
      const newBoard: Board = [...board] as Board;
      newBoard[index] = 'X';
      setBoard(newBoard);

      // Check for player win
      const winner = calculateWinner(newBoard);
      if (winner === 'X') {
        const promoCode = generatePromoCode();
        setLastPromoCode(promoCode);
        setGameStatus('won');
        // Send Telegram notification
        await sendTelegramNotification('win', promoCode);
        return;
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        setGameStatus('draw');
        return;
      }

      // Computer's turn
      setIsComputerThinking(true);
      
      // Add delay to simulate computer thinking (200-300ms)
      await new Promise((resolve) => setTimeout(resolve, 250));

      const computerMove = getComputerMove(newBoard);
      if (computerMove !== -1) {
        const boardAfterComputer: Board = [...newBoard] as Board;
        boardAfterComputer[computerMove] = 'O';
        setBoard(boardAfterComputer);

        // Check for computer win
        const winnerAfterComputer = calculateWinner(boardAfterComputer);
        if (winnerAfterComputer === 'O') {
          setGameStatus('lost');
          setIsComputerThinking(false);
          // Send Telegram notification
          await sendTelegramNotification('lose');
          return;
        }

        // Check for draw after computer move
        if (isBoardFull(boardAfterComputer)) {
          setGameStatus('draw');
          setIsComputerThinking(false);
          return;
        }
      }

      setIsComputerThinking(false);
    },
    [board, gameStatus, isComputerThinking]
  );

  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setGameStatus('active');
    setLastPromoCode(null);
    setIsComputerThinking(false);
  }, []);

  return {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    handleCellClick,
    resetGame,
  };
}

export default function Home() {
  const {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    handleCellClick,
    resetGame,
  } = useGame();

  // Determine status message
  const getStatusMessage = (): string => {
    if (gameStatus === 'won') return 'You won!';
    if (gameStatus === 'lost') return 'You lost!';
    if (gameStatus === 'draw') return "It's a Draw!";
    if (isComputerThinking) return 'Computer thinking...';
    return 'Your turn';
  };

  // Check if cell is disabled
  const isCellDisabled = (index: number): boolean => {
    return (
      board[index] !== null ||
      gameStatus !== 'active' ||
      isComputerThinking
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Tic-Tac-Toe Game
      </h1>

      {/* Game Status */}
      <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>
        {getStatusMessage()}
      </div>

      {/* Promo Code Display */}
      {lastPromoCode && gameStatus === 'won' && (
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
          Your promo code: <strong>{lastPromoCode}</strong>
        </div>
      )}

      {/* Game Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 80px)',
          gridTemplateRows: 'repeat(3, 80px)',
          gap: '4px',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={isCellDisabled(index)}
            style={{
              width: '80px',
              height: '80px',
              fontSize: '24px',
              fontWeight: 'bold',
              backgroundColor: cell ? '#f0f0f0' : 'white',
              border: '2px solid #333',
              cursor: isCellDisabled(index) ? 'not-allowed' : 'pointer',
              color: '#000',
            }}
          >
            {cell || ''}
          </button>
        ))}
      </div>

      {/* Play Again Button */}
      {gameStatus !== 'active' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={resetGame}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
