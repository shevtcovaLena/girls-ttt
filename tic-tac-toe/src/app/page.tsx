'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
 * Telegram WebApp interface
 */
interface TelegramWebApp {
  ready: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

/**
 * Extends Window interface to include Telegram WebApp
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Parses Telegram initData string to extract user information
 */
function parseInitData(initData: string): { userId?: number; userName?: string } {
  try {
    // Parse URL-encoded initData
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        userId: user.id,
        userName: user.first_name || user.username || 'Player',
      };
    }
  } catch (error) {
    console.error('Error parsing initData:', error);
  }
  
  return {};
}

/**
 * Custom hook for managing game state and logic
 */
function useGame(userId?: number, onGameEnd?: (status: 'win' | 'lose', promoCode?: string) => void) {
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
        // Send Telegram notification via callback
        if (onGameEnd) {
          onGameEnd('win', promoCode);
        }
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
          // Send Telegram notification via callback
          if (onGameEnd) {
            onGameEnd('lose');
          }
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
    [board, gameStatus, isComputerThinking, onGameEnd]
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
  const [telegramData, setTelegramData] = useState<{
    userId?: number;
    userName: string;
    isInitialized: boolean;
  }>({
    userId: undefined,
    userName: '',
    isInitialized: false,
  });

  const initializedRef = useRef(false);

  // Initialize Telegram WebApp after component mounts
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Wait for Telegram WebApp SDK to load
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Notify Telegram that the app is ready
        tg.ready();
        
        // Try to get user data from initDataUnsafe (easier but less secure)
        if (tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user;
          setTelegramData({
            userId: user.id,
            userName: user.first_name || user.username || 'Player',
            isInitialized: true,
          });
          return;
        } else if (tg.initData) {
          // Parse initData manually
          const { userId: parsedUserId, userName: parsedUserName } = parseInitData(tg.initData);
          if (parsedUserId) {
            setTelegramData({
              userId: parsedUserId,
              userName: parsedUserName || 'Player',
              isInitialized: true,
            });
            return;
          }
        }
      }
      
      // Mark as initialized even if no user data (not in Telegram context or no data)
      setTelegramData((prev) => ({
        ...prev,
        isInitialized: true,
      }));
    };

    // Check if Telegram WebApp is already loaded
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      initTelegram();
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          initTelegram();
        }
      }, 100);

      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setTelegramData((prev) => {
          if (!prev.isInitialized) {
            return { ...prev, isInitialized: true };
          }
          return prev;
        });
      }, 3000);
    }
  }, []);

  // Callback for game end events
  const handleGameEnd = useCallback(
    async (status: 'win' | 'lose', promoCode?: string) => {
      if (telegramData.userId) {
        await sendTelegramNotification(telegramData.userId, status, promoCode);
      }
    },
    [telegramData.userId]
  );

  const {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    handleCellClick,
    resetGame,
  } = useGame(telegramData.userId, handleGameEnd);

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

  // Show error if not opened from Telegram bot
  if (telegramData.isInitialized && !telegramData.userId) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#d32f2f' }}>
          Ошибка доступа
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Откройте приложение из Telegram бота
        </p>
      </div>
    );
  }

  // Show loading state while initializing
  if (!telegramData.isInitialized) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
        Tic-Tac-Toe Game
      </h1>
      {telegramData.userName && (
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '16px' }}>
          Привет, {telegramData.userName}! 👋
        </p>
      )}

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
